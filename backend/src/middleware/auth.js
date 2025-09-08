import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
export function authMiddleware(req,res,next){ const token = req.headers['authorization']?.split(' ')[1]; if(!token) return res.status(401).json({message:'No token provided'}); try{ const decoded = jwt.verify(token,JWT_SECRET); req.user = decoded; next(); }catch(e){ return res.status(401).json({message:'Invalid token'});} }
export function authorizeRoles(...roles){ return (req,res,next)=>{ if(!req.user || !roles.includes(req.user.role)) return res.status(403).json({message:'Forbidden'}); next(); } }
export function adminOnly(req,res,next){ if(!req.user || req.user.role!=='admin') return res.status(403).json({message:'Admins only'}); next(); }
