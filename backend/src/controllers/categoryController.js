import db from '../models/db.js';
export async function listCategories(req,res){ const cats = await db.all('SELECT id,name FROM categories ORDER BY name'); res.json(cats); }
export async function createCategory(req,res){ const {name}=req.body; if(!name) return res.status(400).json({message:'Name required'}); try{ await db.run('INSERT INTO categories (name) VALUES (?)',[name]); res.json({message:'Category added'}); }catch(e){ res.status(400).json({message:'Category exists or invalid'}); } }
export async function updateCategory(req,res){ const {id}=req.params; const {name}=req.body; await db.run('UPDATE categories SET name=? WHERE id=?',[name,id]); res.json({message:'Category updated'}); }
export async function deleteCategory(req,res){ const {id}=req.params; await db.run('DELETE FROM categories WHERE id=?',[id]); res.json({message:'Category deleted'}); }
