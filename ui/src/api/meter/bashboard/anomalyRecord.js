import request from '@/utils/request'

/**
 * 获取异常记录列表（分页）
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.anomalyType - 异常类型
 * @param {String} params.level - 告警级别
 * @param {String} params.status - 处理状态：0-待处理 1-处理中 2-已解决 3-已忽略
 * @param {String} params.userNo - 用户永久号
 * @param {String} params.meterNo - 表号
 * @param {String} params.startTime - 开始时间
 * @param {String} params.endTime - 结束时间
 * @returns {Promise}
 */
export function getAnomalyRecordList(params) {
  return request({
    url: '/meter/meterreport/anomaly/record/list',
    method: 'get',
    params: params
  })
}

/**
 * 获取异常记录详情
 * @param {Number} id - 记录ID
 * @returns {Promise}
 */
export function getAnomalyRecordDetail(id) {
  return request({
    url: `/meter/meterreport/anomaly/record/${id}`,
    method: 'get'
  })
}

/**
 * 处理异常记录
 * @param {Number} id - 记录ID
 * @param {Object} data - 处理数据
 * @param {String} data.status - 处理状态：1-处理中 2-已解决 3-已忽略
 * @param {String} data.handleRemark - 处理备注
 * @returns {Promise}
 */
export function handleAnomalyRecord(id, data) {
  return request({
    url: `/meter/meterreport/anomaly/record/${id}/handle`,
    method: 'put',
    data: data
  })
}

/**
 * 批量处理异常记录
 * @param {Array} ids - 记录ID列表
 * @param {Object} data - 处理数据
 * @returns {Promise}
 */
export function batchHandleAnomalyRecord(ids, data) {
  return request({
    url: '/meter/meterreport/anomaly/record/batch-handle',
    method: 'put',
    data: {
      ids: ids,
      ...data
    }
  })
}

/**
 * 删除异常记录
 * @param {Number} id - 记录ID
 * @returns {Promise}
 */
export function deleteAnomalyRecord(id) {
  return request({
    url: `/meter/meterreport/anomaly/record/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除异常记录
 * @param {Array} ids - 记录ID列表
 * @returns {Promise}
 */
export function batchDeleteAnomalyRecord(ids) {
  return request({
    url: '/meter/meterreport/anomaly/record/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 获取异常分类统计
 * @param {Object} params - 查询参数
 * @param {String} params.startTime - 开始时间
 * @param {String} params.endTime - 结束时间
 * @returns {Promise}
 */
export function getAnomalyStatistics(params) {
  return request({
    url: '/meter/meterreport/anomaly/record/statistics',
    method: 'get',
    params: params
  })
}

/**
 * 导出异常记录
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportAnomalyRecords(params) {
  return request({
    url: '/meter/meterreport/anomaly/record/export',
    method: 'get',
    params: params,
    responseType: 'blob',
    timeout: 300000 // 5分钟超时，导出可能需要较长时间
  })
}

/**
 * 刷新异常数据（重新检测）
 * @returns {Promise}
 */
export function refreshAnomalyDetection() {
  return request({
    url: '/meter/meterreport/anomaly/record/refresh',
    method: 'post'
  })
}

/**
 * 获取异常趋势数据
 * @param {Object} params - 查询参数
 * @param {String} params.type - 趋势类型：day/week/month
 * @param {Number} params.days - 天数
 * @returns {Promise}
 */
export function getAnomalyTrend(params) {
  return request({
    url: '/meter/meterreport/anomaly/record/trend',
    method: 'get',
    params: params
  })
}
