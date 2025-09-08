import db from '../models/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
export async function loginUser(req,res){ const {email,password}=req.body; const user = await db.get('SELECT * FROM users WHERE email=?',[email]); if(!user) return res.status(404).json({message:'User not found'}); const valid = await bcrypt.compare(password,user.password); if(!valid) return res.status(401).json({message:'Invalid credentials'}); const token = jwt.sign({id:user.id,role:user.role,name:user.name,email:user.email},JWT_SECRET,{expiresIn:'1d'}); res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}}); }
