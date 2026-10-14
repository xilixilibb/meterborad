import request from '@/utils/request'

/**
 * 获取仪表盘概览数据
 * @returns {Promise}
 */
export function getDashboardSummary() {
  return request({
    url: '/meter/meterreport/dashboard/summary',
    method: 'get'
  })
}

/**
 * 获取读数占比数据（智能表 vs 非智能表）
 * @returns {Promise}
 */
export function getReadingRatio() {
  return request({
    url: '/meter/meterreport/dashboard/reading-ratio',
    method: 'get'
  })
}

/**
 * 获取月度用水趋势数据
 * @param {Object} params - 查询参数
 * @param {Number} params.months - 月份数量，默认12
 * @returns {Promise}
 */
export function getMonthlyTrend(params) {
  return request({
    url: '/meter/meterreport/dashboard/monthly-trend',
    method: 'get',
    params
  })
}

/**
 * 获取月度抄表占比数据
 * @param {String} month - 月份，格式：YYYY-MM，不传则为当月
 * @returns {Promise}
 */
export function getMonthlyReadingRatio(month) {
  return request({
    url: '/meter/meterreport/dashboard/monthly-reading-ratio',
    method: 'get',
    params: { month }
  })
}

/**
 * 获取日抄表占比数据
 * @param {String} date - 日期，格式：YYYY-MM-DD，不传则为当日
 * @returns {Promise}
 */
export function getDailyReadingRatio(date) {
  return request({
    url: '/meter/meterreport/dashboard/daily-reading-ratio',
    method: 'get',
    params: { date }
  })
}

/**
 * 获取异常分类统计数据
 * @returns {Promise}
 */
export function getAnomalyCategory() {
  return request({
    url: '/meter/meterreport/dashboard/anomaly-category',
    method: 'get'
  })
}

/**
 * 获取异常告警列表
 * @param {Object} params - 查询参数
 * @param {String} params.type - 异常类型
 * @param {String} params.status - 状态
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getAnomalyList(params) {
  return request({
    url: '/meter/meterreport/dashboard/anomaly-list',
    method: 'get',
    params
  })
}

/**
 * 获取异常详情
 * @param {String|Number} id - 异常ID
 * @returns {Promise}
 */
export function getAnomalyDetail(id) {
  return request({
    url: `/meter/meterreport/dashboard/anomaly/${id}`,
    method: 'get'
  })
}

/**
 * 标记异常为已解决
 * @param {String|Number} id - 异常ID
 * @param {Object} data - 处理数据
 * @returns {Promise}
 */
export function resolveAnomaly(id, data) {
  return request({
    url: `/meter/meterreport/dashboard/anomaly/${id}/resolve`,
    method: 'put',
    data
  })
}

/**
 * 刷新异常数据（重新检测）
 * @returns {Promise}
 */
export function refreshAnomalyData() {
  return request({
    url: '/meter/meterreport/dashboard/anomaly/refresh',
    method: 'post'
  })
}

/**
 * 导出异常数据
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export function exportAnomalyData(params) {
  return request({
    url: '/meter/meterreport/dashboard/anomaly/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.status - 用户状态
 * @returns {Promise}
 */
export function getUserList(params) {
  return request({
    url: '/meter/meterreport/dashboard/users',
    method: 'get',
    params
  })
}

/**
 * 获取智能表列表
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.status - 表具状态
 * @returns {Promise}
 */
export function getSmartMeterList(params) {
  return request({
    url: '/meter/meterreport/dashboard/smart-meters',
    method: 'get',
    params
  })
}

/**
 * 获取非智能表列表
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getNonSmartMeterList(params) {
  return request({
    url: '/meter/meterreport/dashboard/non-smart-meters',
    method: 'get',
    params
  })
}

/**
 * 获取抄表记录列表
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.startDate - 开始日期
 * @param {String} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getReadingRecordList(params) {
  return request({
    url: '/meter/meterreport/dashboard/reading-records',
    method: 'get',
    params
  })
}

/**
 * 获取月度详细数据
 * @param {String} month - 月份，格式：YYYY-MM
 * @returns {Promise}
 */
export function getMonthDetail(month) {
  return request({
    url: `/meter/meterreport/dashboard/month-detail/${month}`,
    method: 'get'
  })
}

/**
 * 获取月度Top用户
 * @param {String} month - 月份，格式：YYYY-MM
 * @param {Number} top - Top数量，默认10
 * @returns {Promise}
 */
export function getMonthTopUsers(month, top = 10) {
  return request({
    url: `/meter/meterreport/dashboard/month-top-users/${month}`,
    method: 'get',
    params: { top }
  })
}

/**
 * 获取实时数据统计
 * @returns {Promise}
 */
export function getRealtimeStats() {
  return request({
    url: '/meter/meterreport/dashboard/realtime-stats',
    method: 'get'
  })
}

/**
 * 获取区域分布数据
 * @returns {Promise}
 */
export function getRegionDistribution() {
  return request({
    url: '/meter/meterreport/dashboard/region-distribution',
    method: 'get'
  })
}

/**
 * 获取表具状态统计
 * @returns {Promise}
 */
export function getMeterStatusStats() {
  return request({
    url: '/meter/meterreport/dashboard/meter-status-stats',
    method: 'get'
  })
}

/**
 * 获取用水排名
 * @param {Object} params - 查询参数
 * @param {String} params.type - 排名类型：daily/monthly/yearly
 * @param {Number} params.top - Top数量
 * @returns {Promise}
 */
export function getUsageRanking(params) {
  return request({
    url: '/meter/meterreport/dashboard/usage-ranking',
    method: 'get',
    params
  })
}

/**
 * 获取异常趋势分析
 * @param {Object} params - 查询参数
 * @param {String} params.startDate - 开始日期
 * @param {String} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getAnomalyTrend(params) {
  return request({
    url: '/meter/meterreport/dashboard/anomaly-trend',
    method: 'get',
    params
  })
}

/**
 * 批量处理异常
 * @param {Object} data - 处理数据
 * @param {Array} data.ids - 异常ID数组
 * @param {String} data.action - 操作类型：resolve/ignore/assign
 * @param {String} data.handler - 处理人
 * @param {String} data.remark - 备注
 * @returns {Promise}
 */
export function batchHandleAnomaly(data) {
  return request({
    url: '/meter/meterreport/dashboard/anomaly/batch',
    method: 'post',
    data
  })
}

/**
 * 获取仪表盘配置
 * @returns {Promise}
 */
export function getDashboardConfig() {
  return request({
    url: '/meter/meterreport/dashboard/config',
    method: 'get'
  })
}

/**
 * 保存仪表盘配置
 * @param {Object} data - 配置数据
 * @returns {Promise}
 */
export function saveDashboardConfig(data) {
  return request({
    url: '/meter/meterreport/dashboard/config',
    method: 'post',
    data
  })
}

/**
 * 获取数据对比分析
 * @param {Object} params - 对比参数
 * @param {String} params.type - 对比类型：month/quarter/year
 * @param {String} params.current - 当前周期
 * @param {String} params.compare - 对比周期
 * @returns {Promise}
 */
export function getDataComparison(params) {
  return request({
    url: '/meter/meterreport/dashboard/data-comparison',
    method: 'get',
    params
  })
}

/**
 * 获取预警规则列表
 * @returns {Promise}
 */
export function getAlertRules() {
  return request({
    url: '/meter/meterreport/dashboard/alert-rules',
    method: 'get'
  })
}

/**
 * 更新预警规则
 * @param {String|Number} id - 规则ID
 * @param {Object} data - 规则数据
 * @returns {Promise}
 */
export function updateAlertRule(id, data) {
  return request({
    url: `/meter/meterreport/dashboard/alert-rules/${id}`,
    method: 'put',
    data
  })
}

/**
 * 获取统计报表数据
 * @param {Object} params - 报表参数
 * @param {String} params.type - 报表类型
 * @param {String} params.startDate - 开始日期
 * @param {String} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getStatisticsReport(params) {
  return request({
    url: '/meter/meterreport/dashboard/statistics-report',
    method: 'get',
    params
  })
}

/**
 * 导出统计报表
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export function exportStatisticsReport(params) {
  return request({
    url: '/meter/meterreport/dashboard/statistics-report/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
