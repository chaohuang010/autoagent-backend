import { createClient } from '@supabase/supabase-js';

// 安全获取环境变量
// 使用 any 类型转换绕过 TS 检查，因为 import.meta.env 在某些配置下可能未定义
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// 避免因为缺少 Key 导致整个应用崩溃白屏
// 如果没有配置 Supabase，返回一个模拟的空客户端，保证页面能正常渲染
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase credentials missing' } }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
      })
    } as any;
