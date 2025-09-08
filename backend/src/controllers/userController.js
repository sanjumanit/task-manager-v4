import db from '../models/db.js';
import bcrypt from 'bcryptjs';
export async function createUser(req,res){ const {name,email,password,role}=req.body; if(!name||!email||!password||!role) return res.status(400).json({message:'name,email,password,role required'}); try{ const hashed = await bcrypt.hash(password,10); await db.run('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',[name,email,hashed,role]); res.json({message:'User created'}); }catch(e){ res.status(400).json({message:'User create failed'}); } }
export async function listUsers(req,res){ const users = await db.all('SELECT id,name,email,role FROM users'); res.json(users); }
