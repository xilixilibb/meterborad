<template>
  <div class="water-dashboard">
    <!-- 刷新控制工具栏 -->
    <el-row class="refresh-toolbar">
      <el-col :span="24">
        <div class="toolbar-content">
          <div class="left-section">
            <el-tag :type="autoRefresh ? 'success' : 'info'" effect="dark">
              <i :class="autoRefresh ? 'el-icon-video-play' : 'el-icon-video-pause'"></i>
              {{ autoRefresh ? '自动刷新已启用' : '自动刷新已暂停' }}
            </el-tag>
            <span v-if="autoRefresh" class="refresh-info">
              下次刷新: {{ nextRefreshTime }}秒后
            </span>
            <span class="last-update">
              最后更新: {{ lastUpdateTime }}
            </span>
          </div>
          <div class="right-section">
            <el-select v-model="refreshInterval" size="small" style="width: 140px; margin-right: 10px;" @change="handleIntervalChange">
              <el-option label="30秒刷新" :value="30"></el-option>
              <el-option label="1分钟刷新" :value="60"></el-option>
              <el-option label="2分钟刷新" :value="120"></el-option>
              <el-option label="5分钟刷新" :value="300"></el-option>
              <el-option label="10分钟刷新" :value="600"></el-option>
            </el-select>
            <el-button-group>
              <el-button size="small" :type="autoRefresh ? 'success' : 'primary'" @click="toggleAutoRefresh">
                <i :class="autoRefresh ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>
                {{ autoRefresh ? '暂停' : '启动' }}
              </el-button>
              <el-button size="small" type="primary" icon="el-icon-refresh" :loading="loading" @click="handleManualRefresh">
                立即刷新
              </el-button>
            </el-button-group>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card bg-primary clickable" @click.native="handleCardClick('user')">
          <i class="el-icon-user-solid icon"></i>
          <div class="content">
            <div class="title">用户总数 (户)</div>
            <div class="value">{{ summaryData.userTotal | formatNumber }}</div>
          </div>
          <i class="el-icon-d-arrow-right arrow-icon"></i>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card bg-success clickable" @click.native="handleCardClick('smartMeter')">
          <i class="el-icon-odometer icon"></i>
          <div class="content">
            <div class="title">智能表总数 (只)</div>
            <div class="value">{{ summaryData.smartMeterTotal | formatNumber }}</div>
          </div>
          <i class="el-icon-d-arrow-right arrow-icon"></i>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card bg-warning clickable" @click.native="handleCardClick('nonSmartMeter')">
          <i class="el-icon-stopwatch icon"></i>
          <div class="content">
            <div class="title">非智能表总数 (只)</div>
            <div class="value">{{ summaryData.nonSmartMeterTotal | formatNumber }}</div>
          </div>
          <i class="el-icon-d-arrow-right arrow-icon"></i>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="metric-card bg-info clickable" @click.native="handleCardClick('reading')">
          <i class="el-icon-s-data icon"></i>
          <div class="content">
            <div class="title">本月总抄表用水量(吨)</div>
            <div class="value">{{ summaryData.totalReading | formatNumber(1) }}</div>
          </div>
          <i class="el-icon-d-arrow-right arrow-icon"></i>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>当月抄度数占比分析 (智能表 vs. 非智能表)</span>
            <el-tooltip content="点击图表查看详细数据" placement="top">
              <i class="el-icon-info header-icon"></i>
            </el-tooltip>
          </div>
          <div id="readingRatioChart" style="height: 350px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>近 12 个月总用水量趋势 (吨)</span>
            <el-tooltip content="点击数据点查看当月详情" placement="top">
              <i class="el-icon-info header-icon"></i>
            </el-tooltip>
          </div>
          <div id="monthlyTrendChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 智能表自动抄表占比 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>智能表月度抄表占比(实际抄表 vs. 总抄表)</span>
            <el-tag type="success" size="small" style="margin-left: 10px;">
              {{ monthlyReadingData.readCount }} / {{ monthlyReadingData.totalCount }}
            </el-tag>
            <el-tooltip content="点击查看详细信息" placement="top">
              <i class="el-icon-info header-icon"></i>
            </el-tooltip>
          </div>
          <div style="position: relative;">
            <div id="monthlyReadingChart" style="height: 350px;"></div>
            <div style="text-align: center; margin-top: 10px;">
              <el-tag type="success">已取数: {{ monthlyReadingData.readCount }} 只</el-tag>
              <el-tag type="info" style="margin-left: 10px;">未取数: {{ monthlyReadingData.unreadCount }} 只</el-tag>
              <el-tag type="warning" style="margin-left: 10px;">抄表率: {{ monthlyReadingData.readRate }}%</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>智能表日抄表占比(实际抄表 vs. 总抄表) ({{ dailyReadingData.date }})</span>
            <el-tag type="success" size="small" style="margin-left: 10px;">
              {{ dailyReadingData.readCount }} / {{ dailyReadingData.totalCount }}
            </el-tag>
            <el-tooltip content="点击查看详细信息" placement="top">
              <i class="el-icon-info header-icon"></i>
            </el-tooltip>
          </div>
          <div style="position: relative;">
            <div id="dailyReadingChart" style="height: 350px;"></div>
            <div style="text-align: center; margin-top: 10px;">
              <el-tag type="success">已取数: {{ dailyReadingData.readCount }} 只</el-tag>
              <el-tag type="info" style="margin-left: 10px;">未取数: {{ dailyReadingData.unreadCount }} 只</el-tag>
              <el-tag type="warning" style="margin-left: 10px;">抄表率: {{ dailyReadingData.readRate }}%</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row class="anomaly-row">
      <el-card shadow="hover">
        <div slot="header" class="clearfix">
          <span>异常用水分类洞察与告警列表</span>
          <el-tag v-if="selectedAnomalyType" type="warning" size="small" closable style="margin-left: 10px;" @close="clearAnomalyFilter">
            <i class="el-icon-filter"></i> 当前筛选：{{ selectedAnomalyType }}
          </el-tag>
          <el-button-group style="float: right;">
            <el-button size="mini" icon="el-icon-setting" type="primary" @click="handleAnomalyConfig">规则配置</el-button>
            <el-button size="mini" icon="el-icon-refresh" @click="refreshAnomalyData">刷新</el-button>
            <el-button size="mini" icon="el-icon-download" @click="exportAnomalyData">导出</el-button>
          </el-button-group>
        </div>
        <el-row :gutter="20">
          <el-col :span="10">
            <div id="anomalyCategoryChart" style="height: 450px;"></div>
          </el-col>

          <el-col :span="14">
            <el-table
              :data="filteredAnomalyList"
              style="width: 100%"
              max-height="450"
              size="small"
              highlight-current-row
              @row-click="handleAnomalyRowClick"
            >
              <el-table-column prop="userNo" label="永久号" width="120" align="center"></el-table-column>
              <el-table-column prop="user" label="用户/地址" width="180"></el-table-column>
              <el-table-column prop="type" label="异常类型" width="130">
                <template slot-scope="scope">
                  <el-tag :type="getAnomalyTagType(scope.row.type)" size="small">
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="level" label="级别" width="90" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getAnomalyLevelTag(scope.row.level)" size="mini">
                    {{ getAnomalyLevelText(scope.row.level) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="异常值" width="120"></el-table-column>
              <el-table-column prop="time" label="发现时间"></el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-card>
    </el-row>

    <!-- 卡片详情弹窗 -->
    <el-dialog
      :title="cardDialogTitle"
      :visible.sync="cardDialogVisible"
      width="70%"
      @close="handleCardDialogClose"
    >
      <el-table :data="cardDialogData" style="width: 100%" max-height="400">
        <el-table-column
          v-for="col in cardDialogColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
        >
          <template slot-scope="scope">
            <span v-if="col.prop === 'status'">
              <el-tag :type="scope.row.status === '1' ? 'success' : 'info'" size="small">
                {{ scope.row.status === '1' ? '正常' : '停用' }}
              </el-tag>
            </span>
            <span v-else>{{ scope.row[col.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="cardDialogData.length > 0"
        style="margin-top: 20px; text-align: right;"
        :current-page="cardDialogPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="cardDialogPageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="cardDialogTotal"
        @size-change="handleCardDialogSizeChange"
        @current-change="handleCardDialogCurrentChange"
      >
      </el-pagination>
    </el-dialog>

    <!-- 月度详情弹窗 -->
    <el-dialog
      :title="monthDialogTitle"
      :visible.sync="monthDialogVisible"
      width="80%"
      @close="handleMonthDialogClose"
    >
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-label">总用水量</div>
              <div class="stat-value">{{ monthDetailData.totalUsage | formatNumber(1) }} 吨</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-label">平均每户用量</div>
              <div class="stat-value">{{ monthDetailData.avgUsage | formatNumber(2) }} 吨</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-label">环比增长</div>
              <div class="stat-value" :class="monthDetailData.growth >= 0 ? 'text-success' : 'text-danger'">
                {{ monthDetailData.growth >= 0 ? '+' : '' }}{{ monthDetailData.growth }}%
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-table :data="monthDetailData.topUsers" style="width: 100%">
        <el-table-column prop="rank" label="排名" width="80"></el-table-column>
        <el-table-column prop="user" label="用户"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="meterType" label="表具类型" width="120"></el-table-column>
        <el-table-column prop="usage" label="用水量(吨)" width="120"></el-table-column>
        <el-table-column prop="fee" label="费用(元)" width="100"></el-table-column>
      </el-table>
    </el-dialog>

    <!-- 异常详情弹窗 -->
    <el-dialog
      title="异常详情"
      :visible.sync="anomalyDialogVisible"
      width="60%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户信息">{{ currentAnomaly.user }}</el-descriptions-item>
        <el-descriptions-item label="异常类型">
          <el-tag :type="getAnomalyTagType(currentAnomaly.type)" size="small">
            {{ currentAnomaly.type }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="异常值">{{ currentAnomaly.value }}</el-descriptions-item>
        <el-descriptions-item label="发现时间">{{ currentAnomaly.time }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <span :class="{'status-pending': currentAnomaly.status === '待处理', 'status-resolved': currentAnomaly.status === '已解决'}">
            {{ currentAnomaly.status }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentAnomaly.handler || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="详细描述" :span="2">
          {{ currentAnomaly.description || '该用户在抄表周期内出现异常读数，需要进一步核查。' }}
        </el-descriptions-item>
        <el-descriptions-item label="历史记录" :span="2">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in currentAnomaly.history"
              :key="index"
              :timestamp="activity.timestamp"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="anomalyDialogVisible = false">关闭</el-button>
        <el-button v-if="currentAnomaly.status === '待处理'" type="primary" @click="handleResolveAnomaly">
          标记为已解决
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  getDashboardSummary,
  getReadingRatio,
  getMonthlyTrend,
  getMonthlyReadingRatio,
  getDailyReadingRatio,
  getUserList,
  getSmartMeterList,
  getNonSmartMeterList,
  getReadingRecordList,
  getMonthDetail,
  getMonthTopUsers
} from '@/api/meter/dashboard/dashboard'

import {
  getAnomalyRecordList,
  getAnomalyRecordDetail,
  handleAnomalyRecord,
  getAnomalyStatistics,
  refreshAnomalyDetection,
  exportAnomalyRecords
} from '@/api/meter/dashboard/anomalyRecord'

export default {
  name: 'MeterDashboard',
  filters: {
    formatNumber(value, decimal = 0) {
      if (value === undefined || value === null) return '-'
      return parseFloat(value).toFixed(decimal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },
  data() {
    return {
      loading: false,
      // 定时刷新相关
      autoRefresh: true,
      refreshInterval: 60,
      refreshTimer: null,
      nextRefreshTime: 0,
      countdownTimer: null,
      lastUpdateTime: '--:--:--',
      // 数据相关
      summaryData: {
        userTotal: 12586,
        smartMeterTotal: 8450,
        nonSmartMeterTotal: 4136,
        totalReading: 215438.7
      },
      readingRatioData: [
        { value: 180000, name: '智能表读数 (83.5%)' },
        { value: 35438, name: '非智能表读数 (16.5%)' }
      ],
      monthlyTrendData: {
        months: ['11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月'],
        total: [150000, 165000, 180000, 175000, 195000, 210000, 230000, 250000, 245000, 220000, 205000, 215438]
      },
      anomalyCategoryData: [
        { value: 45, name: '超高读数 (漏水风险)' },
        { value: 25, name: '零读数 (表具故障)' },
        { value: 15, name: '数据缺失 (通讯问题)' },
        { value: 12, name: '异常低读数 (可疑用水)' },
        { value: 8, name: '异常波动 (用量异常)' },
        { value: 5, name: '负增长 (数据异常)' }
      ],
      anomalyList: [
        { user: '王** (1203#)', type: '超高读数', value: '550m³', time: '2025-11-22 14:30', status: '待处理', level: '1' },
        { user: '城西供水站', type: '数据缺失', value: 'N/A', time: '2025-11-22 10:15', status: '待处理', level: '3' },
        { user: '李** (401#)', type: '零读数', value: '0m³', time: '2025-11-21 18:00', status: '已解决', level: '2' },
        { user: '商铺A', type: '异常低读数', value: '5m³', time: '2025-11-21 09:30', status: '待处理', level: '2' },
        { user: '张** (802#)', type: '超高读数', value: '420m³', time: '2025-11-20 16:45', status: '已解决', level: '1' },
        { user: '工业园B区', type: '数据缺失', value: 'N/A', time: '2025-11-20 11:20', status: '待处理', level: '3' },
        { user: '赵** (305#)', type: '零读数', value: '0m³', time: '2025-11-19 08:15', status: '待处理', level: '2' },
        { user: '某小区A栋', type: '异常波动', value: '环比+85%', time: '2025-11-22 07:00', status: '待处理', level: '2' },
        { user: '学校食堂', type: '负增长', value: '-120m³', time: '2025-11-21 06:30', status: '待处理', level: '1' }
      ],
      // 月度抄表占比数据
      monthlyReadingData: {
        date: '2024年11月',
        totalCount: 15680,
        readCount: 14523,
        unreadCount: 1157,
        readRate: 92.6
      },
      // 日抄表占比数据
      dailyReadingData: {
        date: '2024-11-21',
        totalCount: 15680,
        readCount: 14982,
        unreadCount: 698,
        readRate: 95.5
      },
      charts: {
        readingRatio: null,
        monthlyTrend: null,
        monthlyReading: null,
        dailyReading: null,
        anomalyCategory: null
      },
      // 卡片下钻弹窗
      cardDialogVisible: false,
      cardDialogTitle: '',
      cardDialogData: [],
      cardDialogColumns: [],
      cardDialogPage: 1,
      cardDialogPageSize: 10,
      cardDialogTotal: 0,
      // _fullCardData: [], // 存储完整数据用于前端分页
      cardDialogType: '', // 当前卡片类型（用于后端分页）
      // 月度详情弹窗
      monthDialogVisible: false,
      monthDialogTitle: '',
      monthDetailData: {
        totalUsage: 0,
        avgUsage: 0,
        growth: 0,
        topUsers: []
      },
      // 异常详情
      anomalyDialogVisible: false,
      currentAnomaly: {},
      selectedAnomalyType: null
    }
  },
  computed: {
    filteredAnomalyList() {
      if (!this.selectedAnomalyType) {
        return this.anomalyList
      }
      return this.anomalyList.filter(item => item.type === this.selectedAnomalyType)
    }
  },
  mounted() {
    this.loadDashboardData()
    this.startAutoRefresh()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.stopAutoRefresh()
    window.removeEventListener('resize', this.handleResize)
    this.destroyCharts()
  },
  methods: {
    // 加载仪表盘所有数据
    async loadDashboardData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadSummaryData(),
          this.loadReadingRatioData(),
          this.loadMonthlyTrendData(),
          this.loadMonthlyReadingData(),
          this.loadDailyReadingData(),
          this.loadAnomalyCategoryData(),
          this.loadAnomalyListData()
        ])
        this.$nextTick(() => {
          this.initReadingRatioChart()
          this.initMonthlyTrendChart()
          this.initMonthlyReadingChart()
          this.initDailyReadingChart()
          this.initAnomalyCategoryChart()
        })
      } catch (error) {
        this.$message.error('数据加载失败：' + (error.message || '未知错误'))
      } finally {
        this.loading = false
        this.updateLastRefreshTime()
      }
    },
    // 加载概览数据
    async loadSummaryData() {
      try {
        const response = await getDashboardSummary()
        if (response.success) {
          this.summaryData = response.data
        }
      } catch (error) {
        console.error('加载概览数据失败', error)
        // 使用模拟数据作为降级方案
      }
    },
    // 加载读数占比数据
    async loadReadingRatioData() {
      try {
        const response = await getReadingRatio()
        if (response.success) {
          this.readingRatioData = response.data
        }
      } catch (error) {
        console.error('加载读数占比数据失败readingRatioData', error)
      }
    },
    // 加载月度趋势数据
    async loadMonthlyTrendData() {
      try {
        const response = await getMonthlyTrend({ months: 12 })
        if (response.success) {
          this.monthlyTrendData = response.data
        }
      } catch (error) {
        console.error('加载月度趋势数据失败', error)
      }
    },
    // 加载月度抄表占比数据
    async loadMonthlyReadingData() {
      try {
        const response = await getMonthlyReadingRatio()
        if (response.success && response.data) {
          this.monthlyReadingData = response.data
        }
      } catch (error) {
        console.error('加载月度抄表占比数据失败yyyyyxdx', error)
        // 使用模拟数据
      }
    },
    getYesterday() {
      // 1. 获取当前日期
      const date = new Date()

      // 2. 将日期设置为前一天 (会自动处理跨月、跨年)
      date.setDate(date.getDate() - 1)

      // 3. 获取年、月、日
      const year = date.getFullYear()
      // 月份是从0开始的，所以要+1；使用 padStart 补齐两位的 0
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')

      // 4. 拼接字符串
      return `${year}-${month}-${day}`
    },
    // 加载日抄表占比数据
    async loadDailyReadingData() {
      try {
        const yestoday = this.getYesterday()
        const response = await getDailyReadingRatio(yestoday)

        if (response.success && response.data) {
          this.dailyReadingData = response.data
        }
      } catch (error) {
        console.error('加载日抄表占比数据失败', error)
        // 使用模拟数据
      }
    },
    // 加载异常分类数据
    async loadAnomalyCategoryData() {
      try {
        const response = await getAnomalyStatistics({
          startTime: this.getStartTime(),
          endTime: this.getEndTime()
        })
        if (response.success && response.data) {
          // 转换统计数据为图表格式
          this.anomalyCategoryData = this.formatAnomalyStatistics(response.data)
        } else {
          // 无数据时使用默认类型显示0
          this.anomalyCategoryData = this.getDefaultAnomalyTypes()
        }
      } catch (error) {
        // console.error('加载异常分类数据失败', error)
        // 使用模拟数据
        // 出错时使用默认类型显示0
        this.anomalyCategoryData = this.getDefaultAnomalyTypes()
      }
    },
    // 加载异常列表数据
    async loadAnomalyListData() {
      try {
        const params = {
          pageNum: 1,
          pageSize: 50,
          status: '0' // 只显示待处理的
        }
        // 🔧 修复：如果有选中的异常类型，添加到查询参数中
        if (this.selectedAnomalyType) {
          params.anomalyType = this.selectedAnomalyType
        }
        const response = await getAnomalyRecordList(params)
        if (response.success && response.data) {
          // 支持MyBatis-Plus分页格式
          const records = response.data.records || response.data.list || response.data.rows || response.data
          this.anomalyList = Array.isArray(records) ? records.map(item => ({
            id: item.id,
            userNo: item.userNo,
            user: item.userName || item.userNo,
            type: item.anomalyType,
            value: item.anomalyValue,
            time: item.detectTime,
            status: this.getStatusText(item.status),
            level: item.level
          })) : []
        }
      } catch (error) {
        console.error('加载异常列表数据失败', error)
        // 使用模拟数据
      }
    },
    getAnomalyTagType(type) {
      switch (type) {
        case '超高读数':
          return 'danger'
        case '数据缺失':
          return 'primary'
        case '零读数':
          return 'info'
        case '异常低读数':
          return 'warning'
        case '异常波动':
          return 'warning'
        case '负增长':
          return 'danger'
        default:
          return 'info'
      }
    },
    // 获取告警级别标签类型
    getAnomalyLevelTag(level) {
      const tagMap = {
        '1': 'danger',
        '2': 'warning',
        '3': 'primary',
        '4': 'success'
      }
      return tagMap[level] || 'info'
    },
    // 获取告警级别文本
    getAnomalyLevelText(level) {
      const textMap = {
        '1': '紧急',
        '2': '重要',
        '3': '一般',
        '4': '提示'
      }
      return textMap[level] || '-'
    },
    // 跳转到异常规则配置页面
    handleAnomalyConfig() {
      this.$router.push('/meter/busiconfig/anomalymeter')
    },
    // 卡片点击下钻
    async handleCardClick(type) {
      this.loading = true
      try {
        const typeMap = {
          user: {
            title: '用户列表',
            columns: [
              { prop: 'userNo', label: '永久号', width: '120' },
              { prop: 'name', label: '用户名称', width: '350' },
              { prop: 'address', label: '地址' },
              { prop: 'phone', label: '联系电话', width: '150' },
              { prop: 'status', label: '状态', width: '100' }
            ],
            api: getUserList
          },
          smartMeter: {
            title: '智能表列表',
            columns: [
              { prop: 'meterNo', label: '表号', width: '150' },
              { prop: 'userNo', label: '永久号', width: '100' },
              { prop: 'user', label: '用户', width: '250' },
              { prop: 'address', label: '安装地址' },
              { prop: 'model', label: '型号', width: '120' },
              { prop: 'status', label: '状态', width: '100' }
            ],
            api: getSmartMeterList
          },
          nonSmartMeter: {
            title: '非智能表列表',
            columns: [
              { prop: 'meterNo', label: '表号', width: '150' },
              { prop: 'userNo', label: '永久号', width: '100' },
              { prop: 'user', label: '用户', width: '250' },
              { prop: 'address', label: '安装地址' },
              { prop: 'lastReading', label: '最后读数', width: '120' },
              { prop: 'readDate', label: '抄表日期', width: '120' }
            ],
            api: getNonSmartMeterList
          },
          reading: {
            title: '本月抄表记录',
            columns: [
              { prop: 'date', label: '日期', width: '120' },
              { prop: 'userNo', label: '永久号', width: '100' },
              { prop: 'user', label: '用户' },
              { prop: 'meterNo', label: '表号', width: '150' },
              { prop: 'reading', label: '读数(吨)', width: '100' },
              { prop: 'operator', label: '操作员', width: '100' }
            ],
            api: getReadingRecordList
          }
        }

        const config = typeMap[type]
        this.cardDialogTitle = config.title
        this.cardDialogColumns = config.columns
        //
        //   // 调用API获取数据
        //   const response = await config.api({
        //     pageNum: 1,
        //     pageSize: 50
        //   })
        //
        //   let data = []
        //   if (response.success) {
        //     // data = response.data.list || response.data.rows || response.data
        //     // this.cardDialogTotal = response.data.total || data.length
        //     // 支持多种分页格式：records (MyBatis-Plus), list, rows, 或直接是数组
        //     const rawData = response.data.records || response.data.list || response.data.rows || response.data
        //
        //     // 如果 rawData 是数组，使用它；否则使用空数组
        //     data = Array.isArray(rawData) ? rawData : []
        //
        //     // 获取总数，支持字符串和数字格式
        //     const total = response.data.total
        //     this.cardDialogTotal = total ? parseInt(total) : data.length
        //
        //     console.log(`加载${config.title}：共 ${this.cardDialogTotal} 条，当前页 ${data.length} 条`)
        //
        //     // 如果数据为空，使用模拟数据
        //     if (data.length === 0) {
        //       console.warn('API返回数据为空，使用模拟数据')
        //       data = this.generateFallbackData(type)
        //       this.cardDialogTotal = data.length
        //     }
        //   } else {
        //     console.warn('API调用失败，使用模拟数据', response)
        //     // 降级到模拟数据
        //     data = this.generateFallbackData(type)
        //     this.cardDialogTotal = data.length
        //   }
        //
        //   this.cardDialogPage = 1
        //   this.updateCardDialogData(data)
        //   this.cardDialogVisible = true
        // } catch (error) {
        //   console.error('加载详细数据失败', error)
        //   // 使用模拟数据
        //   const data = this.generateFallbackData(type)
        //   this.cardDialogTotal = data.length
        //   this.cardDialogPage = 1
        //   this.updateCardDialogData(data)
        //   this.cardDialogVisible = true
        // } finally {
        //   this.loading = false
        // }
        this.cardDialogType = type // 记录类型用于后续分页
        this.cardDialogPage = 1 // 重置为第一页

        // 加载第一页数据
        await this.loadCardDialogData()
      } catch (error) {
        console.error('加载详细数据失败', error)
        this.$message.error('数据加载失败')
      } finally {
        this.loading = false
      }
    },
    // 降级方案：生成模拟数据
    generateFallbackData(type) {
      if (type === 'user') return this.generateUserData()
      if (type === 'smartMeter') return this.generateSmartMeterData()
      if (type === 'nonSmartMeter') return this.generateNonSmartMeterData()
      if (type === 'reading') return this.generateReadingData()
      return []
    },
    // 加载卡片弹窗数据（后端分页）
    async loadCardDialogData() {
      if (!this.cardDialogType) return

      this.loading = true
      try {
        const typeMap = {
          user: { api: getUserList },
          smartMeter: { api: getSmartMeterList },
          nonSmartMeter: { api: getNonSmartMeterList },
          reading: { api: getReadingRecordList }
        }

        const config = typeMap[this.cardDialogType]

        // 调用API获取当前页数据
        const response = await config.api({
          pageNum: this.cardDialogPage,
          pageSize: this.cardDialogPageSize
        })

        if (response.success) {
          // 支持多种分页格式：records (MyBatis-Plus), list, rows, 或直接是数组
          const rawData = response.data.records || response.data.list || response.data.rows || response.data
          const data = Array.isArray(rawData) ? rawData : []

          // 获取总数
          const total = response.data.total
          this.cardDialogTotal = total ? parseInt(total) : data.length

          console.log(`加载第 ${this.cardDialogPage} 页：${data.length} 条，共 ${this.cardDialogTotal} 条`)

          // 如果数据为空且是第一页，使用模拟数据
          if (data.length === 0 && this.cardDialogPage === 1) {
            console.warn('API返回数据为空，使用模拟数据')
            const fallbackData = this.generateFallbackData(this.cardDialogType)
            this.cardDialogData = fallbackData.slice(0, this.cardDialogPageSize)
            this.cardDialogTotal = fallbackData.length
          } else {
            this.cardDialogData = data
          }

          this.cardDialogVisible = true
        } else {
          throw new Error('API调用失败')
        }
      } catch (error) {
        console.error('加载详细数据失败', error)
        // 降级到模拟数据
        if (this.cardDialogPage === 1) {
          const fallbackData = this.generateFallbackData(this.cardDialogType)
          this.cardDialogData = fallbackData.slice(0, this.cardDialogPageSize)
          this.cardDialogTotal = fallbackData.length
          this.cardDialogVisible = true
        } else {
          this.$message.error('加载数据失败')
        }
      } finally {
        this.loading = false
      }
    },
    // updateCardDialogData(fullData) {
    //   // 确保 fullData 是数组
    //   if (!Array.isArray(fullData)) {
    //     console.error('updateCardDialogData: fullData 不是数组', fullData)
    //     this.cardDialogData = []
    //     this._fullCardData = []
    //     return
    //   }
    //   console.log('test begin ddddddddddddddddd')
    //   console.log(fullData)
    //   const start = (this.cardDialogPage - 1) * this.cardDialogPageSize
    //   const end = start + this.cardDialogPageSize
    //   this.cardDialogData = fullData.slice(start, end)
    //   this._fullCardData = fullData
    // },
    handleCardDialogSizeChange(val) {
      this.cardDialogPageSize = val
      this.cardDialogPage = 1 // 改变每页大小时重置到第一页
      this.loadCardDialogData() // 重新加载数据
    },
    handleCardDialogCurrentChange(val) {
      this.cardDialogPage = val
      this.loadCardDialogData() // 加载新页数据
    },
    handleCardDialogClose() {
      this.cardDialogData = []
      this.cardDialogType = ''
      this.cardDialogPage = 1
    },
    // 生成模拟数据
    generateUserData() {
      const data = []
      const statuses = ['正常', '欠费', '停用']
      for (let i = 1; i <= 50; i++) {
        data.push({
          id: `U${String(i).padStart(6, '0')}`,
          name: `用户${i}`,
          address: `XX路${i}号`,
          meterCount: Math.floor(Math.random() * 3) + 1,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        })
      }
      return data
    },
    generateSmartMeterData() {
      const data = []
      const models = ['NB-IoT-2023', 'LoRa-2022', '4G-2024']
      const statuses = ['在线', '离线', '故障']
      for (let i = 1; i <= 50; i++) {
        data.push({
          meterNo: `SM${String(i).padStart(8, '0')}`,
          user: `用户${i}`,
          address: `XX路${i}号`,
          model: models[Math.floor(Math.random() * models.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        })
      }
      return data
    },
    generateNonSmartMeterData() {
      const data = []
      for (let i = 1; i <= 50; i++) {
        data.push({
          meterNo: `NM${String(i).padStart(8, '0')}`,
          user: `用户${i + 50}`,
          address: `YY路${i}号`,
          lastReading: (Math.random() * 100).toFixed(2),
          readDate: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
        })
      }
      return data
    },
    generateReadingData() {
      const data = []
      const operators = ['张三', '李四', '王五', '赵六']
      for (let i = 1; i <= 50; i++) {
        data.push({
          date: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          user: `用户${i}`,
          meterNo: `M${String(i).padStart(8, '0')}`,
          reading: (Math.random() * 500).toFixed(2),
          operator: operators[Math.floor(Math.random() * operators.length)]
        })
      }
      return data
    },
    // 月度详情
    async handleMonthDetail(month, value) {
      this.loading = true
      this.monthDialogTitle = `${month} 用水详情`

      try {
        // 构建月份参数 (假设当前年份为2025)
        const monthMap = {
          '11月': '2024-11', '12月': '2024-12',
          '1月': '2025-01', '2月': '2025-02', '3月': '2025-03',
          '4月': '2025-04', '5月': '2025-05', '6月': '2025-06',
          '7月': '2025-07', '8月': '2025-08', '9月': '2025-09',
          '10月': '2025-10'
        }
        const monthParam = monthMap[month]

        // 获取月度详情
        const detailResponse = await getMonthDetail(monthParam)
        const topUsersResponse = await getMonthTopUsers(monthParam, 10)

        if (detailResponse.success) {
          this.monthDetailData = {
            totalUsage: detailResponse.data.totalUsage || value,
            avgUsage: detailResponse.data.avgUsage || (value / this.summaryData.userTotal).toFixed(2),
            growth: detailResponse.data.growth || (Math.random() * 20 - 5).toFixed(1),
            topUsers: topUsersResponse.success ? topUsersResponse.data : this.generateTopUsersData()
          }
        } else {
          throw new Error('获取月度详情失败')
        }
      } catch (error) {
        console.error('加载月度详情失败', error)
        // 使用模拟数据
        this.monthDetailData = {
          totalUsage: value,
          avgUsage: (value / this.summaryData.userTotal).toFixed(2),
          growth: (Math.random() * 20 - 5).toFixed(1),
          topUsers: this.generateTopUsersData()
        }
      } finally {
        this.loading = false
        this.monthDialogVisible = true
      }
    },
    generateTopUsersData() {
      const data = []
      const meterTypes = ['智能表', '非智能表']
      for (let i = 1; i <= 10; i++) {
        const usage = (Math.random() * 1000 + 500).toFixed(1)
        data.push({
          rank: i,
          user: `用户${i}`,
          address: `高用水区XX路${i}号`,
          meterType: meterTypes[Math.floor(Math.random() * meterTypes.length)],
          usage: usage,
          fee: (usage * 3.5).toFixed(2)
        })
      }
      return data
    },
    handleMonthDialogClose() {
      this.monthDetailData = {
        totalUsage: 0,
        avgUsage: 0,
        growth: 0,
        topUsers: []
      }
    },
    // 异常处理
    handleAnomalyRowClick(row) {
      this.handleAnomalyDetail(row)
    },
    async handleAnomalyDetail(row) {
      this.loading = true
      try {
        // 如果有ID，则从API获取详细信息
        if (row.id) {
          const response = await getAnomalyRecordDetail(row.id)
          if (response.success && response.data) {
            const data = response.data
            this.currentAnomaly = {
              id: data.id,
              user: `${data.userName} (${data.userNo})`,
              type: data.anomalyType,
              value: data.anomalyValue,
              time: data.detectTime,
              status: this.getStatusText(data.status),
              level: data.level,
              handler: data.handler,
              description: this.getAnomalyDescription(data.anomalyType),
              history: this.formatAnomalyHistory(data)
            }
          } else {
            throw new Error('获取异常详情失败')
          }
        } else {
          // 使用本地数据
          this.currentAnomaly = {
            ...row,
            handler: row.status === '已解决' ? '系统管理员' : null,
            description: this.getAnomalyDescription(row.type),
            history: this.generateAnomalyHistory(row)
          }
        }
      } catch (error) {
        console.error('加载异常详情失败', error)
        // 降级方案
        this.currentAnomaly = {
          ...row,
          handler: row.status === '已解决' ? '系统管理员' : null,
          description: this.getAnomalyDescription(row.type),
          history: this.generateAnomalyHistory(row)
        }
      } finally {
        this.loading = false
        this.anomalyDialogVisible = true
      }
    },
    getAnomalyDescription(type) {
      const descriptions = {
        '超高读数': '该用户本周期读数异常偏高，可能存在管道漏水或计量异常，建议立即现场核查。',
        '数据缺失': '智能表数据传输失败，可能是通讯问题或设备故障，需检查通讯模块和信号强度。',
        '零读数': '连续多天读数为零，可能是表具故障、阀门关闭或用户长期外出，需现场确认。',
        '异常低读数': '读数明显低于历史平均值，可能存在计量不准、偷漏水行为或用户用水习惯改变。',
        '异常波动': '用水量出现异常波动，与历史同期相比有显著变化，需要关注用水规律是否正常。',
        '负增长': '水表读数出现倒退现象，这是严重的数据异常，可能是表具故障或数据采集错误，需立即处理。'
      }
      return descriptions[type] || '检测到异常情况，需要进一步调查和处理。'
    },
    generateAnomalyHistory(row) {
      const history = [
        { timestamp: row.time, content: `系统自动检测到${row.type}` }
      ]
      if (row.status === '已解决') {
        history.push(
          { timestamp: '2025-10-21 09:00', content: '已派单给维修人员' },
          { timestamp: '2025-10-21 14:30', content: '现场核查完成，问题已修复' }
        )
      }
      return history
    },
    async handleResolveAnomaly() {
      try {
        await this.$confirm('确认已解决该异常?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        this.loading = true
        // 调用API标记为已解决
        if (this.currentAnomaly.id) {
          const response = await handleAnomalyRecord(this.currentAnomaly.id, {
            status: '2', // 2-已解决
            handleRemark: '问题已核查处理完毕'
          })

          if (response.success) {
            // 重新加载异常列表
            await this.loadAnomalyListData()
            await this.loadAnomalyCategoryData()
            // 重绘图表
            this.initAnomalyCategoryChart()
            this.$message.success('处理成功')
            this.anomalyDialogVisible = false
          } else {
            this.$message.error('处理失败：' + (response.msg || '未知错误'))
          }
        } else {
          // 降级方案：本地更新
          const index = this.anomalyList.findIndex(item =>
            item.user === this.currentAnomaly.user && item.time === this.currentAnomaly.time
          )
          if (index !== -1) {
            this.anomalyList[index].status = '已解决'
          }
          this.$message.success('操作成功')
          this.anomalyDialogVisible = false
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('处理异常失败', error)
          this.$message.error('处理失败')
        }
      } finally {
        this.loading = false
      }
    },
    async refreshAnomalyData() {
      this.loading = true
      try {
        // 如果有筛选条件，提示用户刷新范围
        if (this.selectedAnomalyType) {
          await this.$confirm(
            `当前筛选了"${this.selectedAnomalyType}"类型，刷新将重新检测该类型的异常数据。是否继续？`,
            '确认刷新',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info'
            }
          )
        }

        const params = {
          startTime: this.getStartTime(),
          endTime: this.getEndTime()
        }
        // 如果有筛选条件，传递给后端
        if (this.selectedAnomalyType) {
          params.anomalyType = this.selectedAnomalyType
        }

        const response = await refreshAnomalyDetection(params)
        if (response.success || response.code === 200) {
          this.$message.success('异常检测已重新执行')
          // 重新加载数据
          await this.loadAnomalyListData()
          await this.loadAnomalyCategoryData()
          // 重新绘制异常分类图表
          this.initAnomalyCategoryChart()
        } else {
          this.$message.warning('刷新失败：' + (response.msg || response.message || '未知错误'))
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('刷新异常数据失败', error)
          this.$message.error('刷新失败：' + (error.message || '网络错误'))
        }
      } finally {
        this.loading = false
      }
    },
    async exportAnomalyData() {
      this.loading = true
      let loadingMsg = null
      try {
        const params = {
          status: '0', // 待处理
          startTime: this.getStartTime(),
          endTime: this.getEndTime()
        }
        // 如果有筛选条件，添加到导出参数
        if (this.selectedAnomalyType) {
          params.anomalyType = this.selectedAnomalyType
        }
        loadingMsg = this.$message({
          message: '正在导出数据，数据量较大时可能需要几分钟，请耐心等待...',
          type: 'info',
          duration: 0,
          showClose: false
        })
        // this.$message.info('正在导出数据，请稍候...')
        const response = await exportAnomalyRecords(params)

        // 处理响应：responseType为blob时，返回的是完整的response对象
        let blob
        let fileExtension = 'csv' // 默认使用CSV格式
        if (response.data && response.data instanceof Blob) {
          // 如果response.data是Blob，说明是完整的response对象
          blob = response.data

          // 检查Content-Type，判断文件类型
          const contentType = response.headers['content-type'] || blob.type
          console.log('导出文件类型:', contentType, '文件大小:', blob.size)

          // 如果是JSON类型，说明后端返回了错误信息
          if (contentType.includes('application/json') || blob.type === 'application/json') {
            const text = await blob.text()
            console.log('后端返回的错误信息:', text)
            try {
              const errorData = JSON.parse(text)
              throw new Error(errorData.msg || errorData.message || '导出失败')
            } catch (parseError) {
              throw new Error('导出失败：' + text)
            }
          }

          // 根据Content-Type判断文件格式
          if (contentType.includes('text/csv') || contentType.includes('csv')) {
            fileExtension = 'csv'
          } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            fileExtension = 'xlsx'
          } else if (contentType.includes('application/vnd.ms-excel')) {
            fileExtension = 'xls'
          } else if (contentType.includes('application/octet-stream')) {
            // 通用二进制流，尝试从文件名判断，默认使用csv
            const contentDisposition = response.headers['content-disposition']
            if (contentDisposition && contentDisposition.includes('.xlsx')) {
              fileExtension = 'xlsx'
            } else if (contentDisposition && contentDisposition.includes('.xls')) {
              fileExtension = 'xls'
            } else {
              fileExtension = 'csv'
            }
          }

          console.log('确定的文件扩展名:', fileExtension)

          // 检查Blob大小，如果太小可能是错误信息
          if (blob.size < 50) {
            const text = await blob.text()
            console.log('Blob内容过小，内容:', text)
            throw new Error('导出失败：返回的文件无效或为空')
          }
        } else if (response instanceof Blob) {
          // 如果response本身是Blob
          blob = response

          // 同样检查Blob大小
          if (blob.size < 50) {
            const text = await blob.text()
            console.log('Blob内容:', text)
            throw new Error('导出失败：返回的文件无效或为空')
          }
        } else {
          // 其他情况，可能是后端返回了错误
          console.error('意外的响应格式:', response)
          throw new Error(response.msg || response.message || '导出数据格式错误')
        }

        // 处理文件下载
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const typeLabel = this.selectedAnomalyType ? `_${this.selectedAnomalyType}` : ''
        link.download = `异常记录${typeLabel}_${timestamp}.${fileExtension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 延迟释放URL，确保下载完成
        setTimeout(() => {
          window.URL.revokeObjectURL(link.href)
        }, 100)

        if (loadingMsg) loadingMsg.close()
        this.$message.success('导出成功')
      } catch (error) {
        loadingMsg.close()
        console.error('导出异常数据失败', error)

        // 判断是否是超时错误
        if (error.message && error.message.includes('timeout')) {
          this.$message({
            message: '导出超时：数据量过大，建议缩短时间范围或联系管理员',
            type: 'warning',
            duration: 5000,
            showClose: true
          })
        } else {
          this.$message.error('导出失败：' + (error.message || '未知错误'))
        }
      } finally {
        this.loading = false
      }
    },
    initReadingRatioChart() {
      const chartDom = document.getElementById('readingRatioChart')
      if (!chartDom) return
      this.charts.readingRatio = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} 吨 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.readingRatioData.map(item => item.name)
        },
        series: [
          {
            name: '总抄度占比',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['65%', '50%'],
            data: this.readingRatioData,
            label: {
              show: true,
              formatter: '{b}\n{c} 吨\n{d}%',
              fontSize: 12,
              fontWeight: 'bold'
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            }
          }
        ]
      }
      this.charts.readingRatio.setOption(option)
      // 添加点击事件
      this.charts.readingRatio.on('click', (params) => {
        const type = params.name.includes('智能表') ? 'smartMeter' : 'nonSmartMeter'
        this.handleCardClick(type)
      })
    },
    initMonthlyTrendChart() {
      const chartDom = document.getElementById('monthlyTrendChart')
      if (!chartDom) return
      this.charts.monthlyTrend = echarts.init(chartDom)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        xAxis: {
          type: 'category',
          data: this.monthlyTrendData.months
        },
        yAxis: {
          type: 'value',
          name: '用水量 (吨)'
        },
        series: [{
          name: '总用水量',
          type: 'line',
          data: this.monthlyTrendData.total,
          smooth: true,
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ])
          }
        }]
      }
      this.charts.monthlyTrend.setOption(option)
      // 添加点击事件
      this.charts.monthlyTrend.on('click', (params) => {
        this.handleMonthDetail(params.name, params.value)
      })
    },
    initMonthlyReadingChart() {
      const chartDom = document.getElementById('monthlyReadingChart')
      if (!chartDom) return
      this.charts.monthlyReading = echarts.init(chartDom)

      const readRate = this.monthlyReadingData.readRate

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} 只 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          data: ['已取数', '未取数']
        },
        color: ['#67c23a', '#e6a23c'],
        graphic: [
          {
            type: 'text',
            left: '51%',
            top: '42%',
            style: {
              text: readRate + '%',
              textAlign: 'center',
              fill: '#67c23a',
              fontSize: 40,
              fontWeight: 'bold'
            },
            z: 100
          },
          {
            type: 'text',
            left: '60%',
            top: '54%',
            style: {
              text: '抄表率',
              textAlign: 'center',
              fill: '#909399',
              fontSize: 16
            },
            z: 100
          }
        ],
        series: [
          {
            name: '月度抄表',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c} 只\n{d}%',
              fontSize: 12,
              fontWeight: 'bold'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10
            },
            data: [
              { value: this.monthlyReadingData.readCount, name: '已取数' },
              { value: this.monthlyReadingData.unreadCount, name: '未取数' }
            ]
          }
        ]
      }

      this.charts.monthlyReading.setOption(option)
      this.charts.monthlyReading.on('click', (params) => {
        this.$message({
          message: `${params.name}: ${params.value} 只 (${params.percent}%)`,
          type: 'info'
        })
      })
    },
    initDailyReadingChart() {
      const chartDom = document.getElementById('dailyReadingChart')
      if (!chartDom) return
      this.charts.dailyReading = echarts.init(chartDom)

      const readRate = this.dailyReadingData.readRate

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} 只 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          data: ['已取数', '未取数']
        },
        color: ['#409eff', '#f56c6c'],
        graphic: [
          {
            type: 'text',
            left: '51%',
            top: '42%',
            style: {
              text: readRate + '%',
              textAlign: 'center',
              fill: '#409eff',
              fontSize: 40,
              fontWeight: 'bold'
            },
            z: 100
          },
          {
            type: 'text',
            left: '60%',
            top: '54%',
            style: {
              text: '抄表率',
              textAlign: 'center',
              fill: '#909399',
              fontSize: 16
            },
            z: 100
          }
        ],
        series: [
          {
            name: '日抄表',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}\n{c} 只\n{d}%',
              fontSize: 12,
              fontWeight: 'bold'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 10
            },
            data: [
              { value: this.dailyReadingData.readCount, name: '已取数' },
              { value: this.dailyReadingData.unreadCount, name: '未取数' }
            ]
          }
        ]
      }

      this.charts.dailyReading.setOption(option)
      this.charts.dailyReading.on('click', (params) => {
        this.$message({
          message: `${params.name}: ${params.value} 只 (${params.percent}%)`,
          type: 'info'
        })
      })
    },
    initAnomalyCategoryChart() {
      const chartDom = document.getElementById('anomalyCategoryChart')
      if (!chartDom) return
      this.charts.anomalyCategory = echarts.init(chartDom)
      // 计算总数
      const totalCount = this.anomalyCategoryData.reduce((sum, item) => sum + item.value, 0)

      const option = {
        title: {
          text: `异常类型分布 (总计: ${totalCount} 条)`,
          left: 'center',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} <br/>数量: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'bottom',
          data: this.anomalyCategoryData.map(item => item.name)
        },
        series: [
          {
            name: '异常分类',
            type: 'pie',
            radius: '50%',
            center: ['62%', '50%'],
            data: this.anomalyCategoryData,
            label: {
              show: true,
              formatter: '{b}\n{c} 条\n{d}%',
              fontSize: 11,
              fontWeight: 'bold'
            },
            labelLine: {
              show: true,
              length: 10,
              length2: 8
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                show: true,
                fontSize: 13,
                fontWeight: 'bold'
              }
            }
          }
        ]
      }
      this.charts.anomalyCategory.setOption(option)
      // 添加点击事件 - 筛选异常列表
      this.charts.anomalyCategory.on('click', async(params) => {
        const typeMap = {
          '超高读数 (漏水风险)': '超高读数',
          '零读数 (表具故障)': '零读数',
          '数据缺失 (通讯问题)': '数据缺失',
          '异常低读数 (可疑用水)': '异常低读数',
          '异常波动 (用量异常)': '异常波动',
          '负增长 (数据异常)': '负增长'
        }
        this.selectedAnomalyType = typeMap[params.name]
        this.$message.info(`已筛选：${this.selectedAnomalyType}，正在加载数据...`)
        // 🔧 修复：立即重新加载异常列表数据，传递筛选条件
        await this.loadAnomalyListData()
        // 高亮显示选中的扇形
        this.charts.anomalyCategory.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          name: params.name
        })
        // 10分钟后取消筛选
        setTimeout(async() => {
          this.selectedAnomalyType = null
          // 🔧 修复：取消筛选时也重新加载全部数据
          await this.loadAnomalyListData()
          this.charts.anomalyCategory.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            name: params.name
          })
          this.$message.success('已恢复显示全部异常')
        }, 600000)
      })
    },
    // 清除异常类型筛选
    async clearAnomalyFilter() {
      this.selectedAnomalyType = null
      await this.loadAnomalyListData()
      // 取消图表高亮
      if (this.charts.anomalyCategory) {
        this.charts.anomalyCategory.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        })
      }
      this.$message.success('已清除筛选，显示全部异常')
    },
    handleResize() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.resize()
        }
      })
    },
    destroyCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.dispose()
        }
      })
    },
    // 定时刷新控制方法
    startAutoRefresh() {
      if (!this.autoRefresh) return

      this.stopAutoRefresh()
      this.nextRefreshTime = this.refreshInterval

      // 启动倒计时
      this.countdownTimer = setInterval(() => {
        if (this.nextRefreshTime > 0) {
          this.nextRefreshTime--
        }
      }, 1000)

      // 启动刷新定时器
      this.refreshTimer = setInterval(() => {
        this.loadDashboardData()
        this.nextRefreshTime = this.refreshInterval
      }, this.refreshInterval * 1000)
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },
    toggleAutoRefresh() {
      this.autoRefresh = !this.autoRefresh
      if (this.autoRefresh) {
        this.startAutoRefresh()
        this.$message.success('已启用自动刷新')
      } else {
        this.stopAutoRefresh()
        this.$message.info('已暂停自动刷新')
      }
    },
    handleIntervalChange() {
      if (this.autoRefresh) {
        this.startAutoRefresh()
        this.$message.success(`刷新间隔已更新为 ${this.refreshInterval} 秒`)
      }
    },
    async handleManualRefresh() {
      await this.loadDashboardData()
      this.$message.success('数据已刷新')
      // 重置倒计时
      if (this.autoRefresh) {
        this.nextRefreshTime = this.refreshInterval
      }
    },
    updateLastRefreshTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      this.lastUpdateTime = `${hours}:${minutes}:${seconds}`
    },
    // ==================== 辅助方法 ====================
    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        '0': '待处理',
        '1': '处理中',
        '2': '已解决',
        '3': '已忽略'
      }
      return statusMap[status] || '未知'
    },
    /**
     * 获取默认异常类型列表（用于无数据时显示）
     */
    getDefaultAnomalyTypes() {
      return [
        { value: 0, name: '超高读数', anomalyType: '超高读数', description: '漏水风险' },
        { value: 0, name: '异常低读数', anomalyType: '异常低读数', description: '可疑用水' },
        { value: 0, name: '零读数', anomalyType: '零读数', description: '表具故障' },
        { value: 0, name: '数据缺失', anomalyType: '数据缺失', description: '通讯问题' },
        { value: 0, name: '异常波动', anomalyType: '异常波动', description: '用量异常' },
        { value: 0, name: '负增长', anomalyType: '负增长', description: '数据异常' }
      ]
    },
    /**
     * 格式化异常统计数据为图表格式
     */
    formatAnomalyStatistics(data) {
      // 获取默认类型作为基础
      const defaultTypes = this.getDefaultAnomalyTypes()
      const typeMap = {}

      // 初始化类型映射
      defaultTypes.forEach(item => {
        typeMap[item.anomalyType] = {
          value: 0,
          name: `${item.anomalyType} (${item.description})`,
          anomalyType: item.anomalyType,
          description: item.description
        }
      })

      // 处理API返回的数据
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          const type = item.anomalyType || item.name
          if (typeMap[type]) {
            typeMap[type].value = item.count || item.value || 0
          }
        })
      } else if (data && typeof data === 'object') {
        // 兼容对象格式
        if (data.superHighCount !== undefined) typeMap['超高读数'].value = data.superHighCount || 0
        if (data.lowCount !== undefined) typeMap['异常低读数'].value = data.lowCount || 0
        if (data.zeroCount !== undefined) typeMap['零读数'].value = data.zeroCount || 0
        if (data.missingCount !== undefined) typeMap['数据缺失'].value = data.missingCount || 0
        if (data.fluctuationCount !== undefined) typeMap['异常波动'].value = data.fluctuationCount || 0
        if (data.negativeCount !== undefined) typeMap['负增长'].value = data.negativeCount || 0
      }

      // 返回格式化后的数组，保持顺序
      return defaultTypes.map(item => typeMap[item.anomalyType])
    },
    /**
     * 格式化异常历史记录
     */
    formatAnomalyHistory(data) {
      const history = []
      if (data.detectTime) {
        history.push({
          timestamp: data.detectTime,
          content: `系统自动检测到${data.anomalyType}`
        })
      }
      if (data.status === '1' || data.status === '2') {
        history.push({
          timestamp: data.handleTime || new Date().toLocaleString(),
          content: `${data.handler || '系统管理员'} 开始处理`
        })
      }
      if (data.status === '2') {
        history.push({
          timestamp: data.handleTime || new Date().toLocaleString(),
          content: `问题已解决：${data.handleRemark || '已处理完成'}`
        })
      }
      return history
    },
    /**
     * 获取开始时间（默认30天前）
     */
    getStartTime() {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString().slice(0, 10)
    },
    /**
     * 获取结束时间（今天）
     */
    getEndTime() {
      return new Date().toISOString().slice(0, 10)
    }
  }
}
</script>

<style scoped lang="scss">
.water-dashboard {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.summary-cards {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.anomaly-row {
  margin-bottom: 20px;
}

.metric-card {
  height: 100px;
  display: flex;
  align-items: center;
  color: #fff;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

      .arrow-icon {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }

  ::v-deep .el-card__body {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 20px;
  }

  .icon {
    font-size: 40px;
    margin-right: 15px;
    opacity: 0.9;
  }

  .content {
    flex-grow: 1;
  }

  .title {
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  .value {
    font-size: 24px;
    font-weight: bold;
  }

  .arrow-icon {
    position: absolute;
    right: 15px;
    font-size: 24px;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
  }
}

.bg-primary {
  background: linear-gradient(135deg, #409EFF 0%, #53a8ff 100%);
  border-color: #409EFF;
}

.bg-success {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  border-color: #67C23A;
}

.bg-warning {
  background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
  border-color: #E6A23C;
}

.bg-info {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
  border-color: #909399;
}

.status-pending {
  color: #E6A23C;
  font-weight: bold;
}

.status-resolved {
  color: #67C23A;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

::v-deep .el-card {
  border-radius: 4px;

  .el-card__header {
    font-weight: 600;
    font-size: 15px;
    padding: 18px 20px;
    border-bottom: 1px solid #EBEEF5;

    .header-icon {
      float: right;
      color: #909399;
      cursor: help;

      &:hover {
        color: #409EFF;
      }
    }
  }
}

::v-deep .el-table {
  th {
    background-color: #f5f7fa;
  }

  .el-table__row {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.stat-item {
  text-align: center;
  padding: 10px;

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;

    &.text-success {
      color: #67C23A;
    }

    &.text-danger {
      color: #F56C6C;
    }
  }
}

::v-deep .el-descriptions {
  margin-bottom: 20px;
}

::v-deep .el-timeline {
  padding-left: 0;
}

// 刷新工具栏样式
.refresh-toolbar {
  margin-bottom: 20px;

  .toolbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .left-section {
      display: flex;
      align-items: center;
      gap: 15px;

      .refresh-info {
        color: #67C23A;
        font-size: 13px;
        font-weight: 500;
      }

      .last-update {
        color: #909399;
        font-size: 13px;
      }
    }

    .right-section {
      display: flex;
      align-items: center;
    }
  }
}
</style>
