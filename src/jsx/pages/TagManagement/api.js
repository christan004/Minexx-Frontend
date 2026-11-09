/**
 * Tag Management API (/tag-management/*).
 * axiosInstance adds the auth headers and x-platform (3ts | gold) from localStorage.
 * Every endpoint answers { success, data }; these helpers return `data`.
 */
import axiosInstance from '../../../services/AxiosInstance';

const BASE = 'tag-management';

const get = async (path, params) => (await axiosInstance.get(`${BASE}/${path}`, { params })).data.data;
const post = async (path, body) => (await axiosInstance.post(`${BASE}/${path}`, body)).data.data;
const put = async (path, body) => (await axiosInstance.put(`${BASE}/${path}`, body)).data.data;
const del = async (path) => (await axiosInstance.delete(`${BASE}/${path}`)).data.data;

// Drop empty filter values so they are not sent as `?status=`.
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined));

/** Message to show for a failed request (API message, validation message or network error). */
export const errorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

export const tagApi = {
  types: () => get('types'),
  summary: () => get('summary'),
  companies: (search) => get('companies', clean({ search })),

  // Settings (admin) and low stock alerts
  updateTypeSettings: (id, body) => put(`types/${id}`, body),
  companyMinimums: () => get('company-minimums'),
  setCompanyMinimum: (body) => put('company-minimums', body),
  removeCompanyMinimum: (companyId, tagTypeId) =>
    del(`company-minimums/${encodeURIComponent(companyId)}/${tagTypeId}`),
  stockAlerts: () => get('stock-alerts'),

  nextStart: (prefix) => get('batches/next-start', clean({ prefix })),
  generateBatch: (body) => post('batches', body),
  listBatches: (filters) => get('batches', clean(filters)),
  getBatch: (id) => get(`batches/${id}`),
  cancelBatch: (id, reason) => post(`batches/${id}/cancel`, { reason }),

  availableRanges: (tagTypeId) => get('available-ranges', { tagTypeId }),
  assignTags: (body) => post('allocations', body),
  listAllocations: (filters) => get('allocations', clean(filters)),
  returnTags: (id, body) => post(`allocations/${id}/return`, clean(body)),

  listTags: (filters) => get('tags', clean(filters)),
  getTag: (code) => get(`tags/${encodeURIComponent(code)}`),
  voidTags: (tagCodes, reason) => post('tags/void', { tagCodes, reason }),
  validateTag: (body) => post('tags/validate', body),

  useFailures: (filters) => get('use-failures', clean(filters)),
  retryUseFailure: (id) => post(`use-failures/${id}/retry`),
  resolveUseFailure: (id, note) => post(`use-failures/${id}/resolve`, { note }),

  balances: (filters) => get('balances', clean(filters)),
  events: (filters) => get('events', clean(filters)),
};
