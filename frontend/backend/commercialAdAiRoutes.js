const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const { authenticateToken } = require('./authMiddleware');
const CommercialAd = require('./commercialAdModel');
const { PRICES, priceFor } = require('./commercialAdRoutes');

const router = express.Router();
const FRONTEND = (process.env.FRONTEND_ORIGIN || 'https://saiedahm.github.io').replace(/\/$/, '');

function safeUrl(value) { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.toString() : ''; } catch { return ''; } }
function fallbackCreative(a) { return { headline: `${a.companyName} — ${a.category}`, body: `${a.message}\nJetzt entdecken und mehr erfahren.`, callToAction: 'Mehr erfahren' }; }

router.post('/api/commercial-ads/ai-draft', authenticateToken, async (req, res) => {
  try {
    const { space, companyName, category, message, audience, destination, imageUrl = '', durationMonths = 1 } = req.body || {};
    const s = Number(space); const months = Number(durationMonths);
    if (![1,2,3,4].includes(s) || !PRICES[months]?.[s]) return res.status(400).json({ error: 'المساحة أو المدة غير صحيحة.' });
    const url = safeUrl(destination);
    if (!url) return res.status(400).json({ error: 'أدخل رابطًا صحيحًا يبدأ بـ https://.' });
    if (!companyName || !category || !message || !audience) return res.status(400).json({ error: 'أكمل الأسئلة الأساسية.' });
    const input = { companyName:String(companyName).slice(0,160), category:String(category).slice(0,120), message:String(message).slice(0,1000), audience:String(audience).slice(0,300), destination:url };
    let creative = fallbackCreative(input);
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({ model:process.env.OPENAI_MODEL||'gpt-5.6-luna', messages:[{role:'system',content:'You are a commercial advertising creative director. Create concise truthful ad copy from the supplied business facts. Do not invent discounts, prices, awards, claims or guarantees. Return JSON with headline, body, callToAction. Reply in the customer language if the input is Arabic/German/English.'},{role:'user',content:JSON.stringify(input)}],response_format:{type:'json_object'},temperature:.35}) });
      if (response.ok) { const data=await response.json(); try { const parsed=JSON.parse(data?.choices?.[0]?.message?.content||'{}'); if(parsed.headline&&parsed.body) creative={headline:String(parsed.headline).slice(0,180),body:String(parsed.body).slice(0,800),callToAction:String(parsed.callToAction||'Mehr erfahren').slice(0,80)}; } catch {} }
    }
    const creativeHtml = `<div class="sakan-ai-ad"><h2>${String(creative.headline).replace(/[<>]/g,'')}</h2><p>${String(creative.body).replace(/[<>]/g,'').replace(/\n/g,'<br>')}</p><a href="${url}" rel="nofollow noopener">${String(creative.callToAction).replace(/[<>]/g,'')}</a></div>`;
    const ad = await CommercialAd.create({ userId:req.user.userId, space:s, companyName:input.companyName, category:input.category, message:input.message, audience:input.audience, destination:url, imageUrl:String(imageUrl).slice(0,1200000), creativeHtml, durationMonths:months, priceCents:priceFor(s,months), currency:'eur', status:'draft', customerApproved:false });
    res.status(201).json({ok:true,ad,creative,priceCents:ad.priceCents,priceEuro:ad.priceCents/100});
  } catch (error) { console.error('COMMERCIAL AI DRAFT ERROR',error); res.status(500).json({error:'تعذر إنشاء الإعلان بالذكاء الاصطناعي.'}); }
});

router.get('/api/commercial-ads/verify', authenticateToken, async (req,res)=>{
  try {
    const sessionId=String(req.query.session_id||''); if(!sessionId)return res.status(400).json({error:'جلسة الدفع غير موجودة.'});
    const session=await stripe.checkout.sessions.retrieve(sessionId); if(session.payment_status!=='paid')return res.status(402).json({paid:false});
    if(session.metadata?.type!=='COMMERCIAL_AD'||String(session.metadata?.userId)!==String(req.user.userId))return res.status(403).json({error:'جلسة الدفع غير صالحة.'});
    const ad=await CommercialAd.findOne({_id:session.metadata.adId,userId:req.user.userId}); if(!ad)return res.status(404).json({error:'الإعلان غير موجود.'});
    const startsAt=new Date(); const endsAt=new Date(startsAt); endsAt.setMonth(endsAt.getMonth()+ad.durationMonths);
    ad.stripeSessionId=session.id; ad.paidAt=new Date(); ad.startsAt=startsAt; ad.endsAt=endsAt; ad.status='active'; ad.aiApproved=true; ad.customerApproved=true; await ad.save();
    res.json({paid:true,active:true,ad});
  } catch(error){console.error('COMMERCIAL VERIFY ERROR',error);res.status(500).json({error:'تعذر تأكيد الدفع.'});}
});

module.exports=router;
