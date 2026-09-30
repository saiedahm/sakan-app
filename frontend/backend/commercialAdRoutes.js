const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const { authenticateToken } = require('./authMiddleware');
const CommercialAd = require('./commercialAdModel');
const { User } = require('./models');

const router = express.Router();
const FRONTEND = (process.env.FRONTEND_ORIGIN || 'https://saiedahm.github.io').replace(/\/$/, '');
const PRICES = { 1: { 1: 49900, 2: 29900, 3: 29900, 4: 14900 }, 3: { 1: 129900, 2: 79900, 3: 79900, 4: 39900 }, 6: { 1: 239900, 2: 149900, 3: 149900, 4: 74900 }, 12: { 1: 449900, 2: 279900, 3: 279900, 4: 139900 } };
function priceFor(space, months) { return PRICES[months]?.[space] || 0; }
function safeUrl(value) { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.toString() : ''; } catch { return ''; } }

router.get('/api/commercial-ads/active', async (_req, res) => { try { const now=new Date(); const ads=await CommercialAd.find({status:'active',startsAt:{$lte:now},endsAt:{$gt:now}}).sort({space:1}).lean(); res.json({ads}); } catch(error){ console.error('COMMERCIAL ACTIVE ERROR',error); res.status(500).json({error:'تعذر تحميل الإعلانات.'}); } });

router.post('/api/commercial-ads/draft', authenticateToken, async (req,res)=>{ try { const {space,companyName,category,message,audience,destination,imageUrl='',creativeHtml='',durationMonths=1}=req.body||{}; const s=Number(space),m=Number(durationMonths); if(![1,2,3,4].includes(s)||![1,3,6,12].includes(m))return res.status(400).json({error:'المساحة أو المدة غير صحيحة.'}); const user=await User.findById(req.user.userId).select('email displayName'); if(!user)return res.status(404).json({error:'الحساب غير موجود.'}); const url=safeUrl(destination); if(!url)return res.status(400).json({error:'أدخل رابطًا صالحًا يبدأ بـ https://.'}); if(!companyName||!category||!message||!audience)return res.status(400).json({error:'أكمل بيانات الإعلان الأساسية.'}); const ad=await CommercialAd.create({userId:user._id,space:s,companyName:String(companyName).trim(),category:String(category).trim(),message:String(message).trim(),audience:String(audience).trim(),destination:url,imageUrl:String(imageUrl).slice(0,1200000),creativeHtml:String(creativeHtml).slice(0,100000),durationMonths:m,priceCents:priceFor(s,m),status:'draft',customerApproved:false}); res.status(201).json({ok:true,ad,priceCents:ad.priceCents,priceEuro:ad.priceCents/100}); } catch(error){ console.error('COMMERCIAL DRAFT ERROR',error); res.status(500).json({error:'تعذر حفظ مسودة الإعلان.'}); } });

router.post('/api/commercial-ads/:id/checkout', authenticateToken, async (req,res)=>{ try { const ad=await CommercialAd.findOne({_id:req.params.id,userId:req.user.userId}); if(!ad)return res.status(404).json({error:'الإعلان غير موجود.'}); if(!ad.creativeHtml&&!ad.imageUrl)return res.status(409).json({error:'أكمل تصميم الإعلان قبل الدفع.'}); ad.customerApproved=true; ad.status='awaiting_payment'; await ad.save(); const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card'],line_items:[{price_data:{currency:'eur',product_data:{name:`SAKAN إعلان تجاري — مساحة ${ad.space} — ${ad.durationMonths} شهر`},unit_amount:ad.priceCents},quantity:1}],metadata:{type:'COMMERCIAL_AD',adId:String(ad._id),userId:String(ad.userId),space:String(ad.space),durationMonths:String(ad.durationMonths)},success_url:`${FRONTEND}/frontend/pages/home.html?commercial_payment=success&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${FRONTEND}/frontend/pages/home.html?commercial_payment=cancelled`}); ad.stripeSessionId=session.id; await ad.save(); res.json({ok:true,url:session.url}); } catch(error){ console.error('COMMERCIAL CHECKOUT ERROR',error); res.status(500).json({error:'تعذر فتح Stripe.'}); } });

router.post('/api/commercial-ads/:id/approve', authenticateToken, async (req,res)=>{ const ad=await CommercialAd.findOneAndUpdate({_id:req.params.id,userId:req.user.userId},{$set:{customerApproved:true,status:'awaiting_payment'}},{new:true}); if(!ad)return res.status(404).json({error:'الإعلان غير موجود.'}); res.json({ok:true,ad}); });

module.exports={router,PRICES,priceFor};
