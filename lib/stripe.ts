// 临时Mock - Stripe库未安装时的fallback
export const stripe = {
  billingPortal: {
    sessions: {
      create: async (params: any) => {
        console.warn('Stripe is mocked - install stripe package for actual payment processing');
        return {
          url: 'https://mock-stripe-portal-url.com',
          id: 'mock_portal_session_id',
          ...params
        };
      }
    }
  },
  checkout: {
    sessions: {
      create: async (params: any) => {
        // 返回一个模拟的session对象
        console.warn('Stripe is mocked - install stripe package for actual payment processing');
        return {
          url: 'https://mock-stripe-checkout-url.com',
          id: 'mock_session_id',
          ...params
        };
      }
    }
  },
  subscriptions: {
    retrieve: async (_id: string) => ({
      cancel_at_period_end: false,
    }),
  }
};
