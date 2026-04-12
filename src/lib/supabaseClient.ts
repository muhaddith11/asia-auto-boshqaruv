import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Create a safe, non-crashing mock if credentials are missing
const createMockSupabase = () => {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'auth') return { 
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      };
      
      // Chainable methods like .from('table').select('*')
      const noop = () => new Proxy(() => {}, handler);
      
      // Leaf resolution (the actual promise calls)
      if (typeof prop === 'string' && ['then', 'catch', 'finally'].includes(prop)) {
        return Promise.resolve({ data: [], count: 0, error: null })[prop as keyof Promise<any>];
      }

      // Return a function that persists the proxy chain
      return new Proxy(() => Promise.resolve({ data: [], error: null }), handler);
    },
    // Handle function calls like .from('...')
    apply(target, thisArg, argumentsList) {
      return new Proxy({}, handler);
    }
  };

  return new Proxy({}, handler);
};

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockSupabase();

export default supabase;
