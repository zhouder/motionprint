// ============================================================
// MotionPrint — i18n Translations
// ============================================================

export type Language = 'zh' | 'en';

export interface TranslationDict {
  // Nav
  navToday: string;
  navGallery: string;
  navSettings: string;

  // Theme names
  themeTerrain: string;
  themeInk: string;
  themeNeon: string;

  // Stats
  statDistance: string;
  statActiveTime: string;
  statClicks: string;
  statScrolls: string;
  statLongestPause: string;
  statSamples: string;

  // Units
  unitMeters: string;
  unitKilometers: string;
  unitHours: string;
  unitMinutes: string;
  unitSeconds: string;

  // Recording status
  statusRecording: string;
  statusPaused: string;
  statusStopped: string;
  statusEmptyRecording: string;
  statusEmptyPaused: string;

  // Live preview
  liveTitle: string;

  // Gallery
  galleryTitle: string;
  galleryExport: string;
  galleryDelete: string;
  galleryEmpty: string;

  // Export
  exportTitle: string;
  exportPrompt: string;
  exportCustom: string;
  exportSetSize: string;
  exportWidth: string;
  exportHeight: string;
  exportBackToPresets: string;
  exportCancel: string;

  // Calendar
  calSun: string;
  calMon: string;
  calTue: string;
  calWed: string;
  calThu: string;
  calFri: string;
  calSat: string;
  calJanuary: string;
  calFebruary: string;
  calMarch: string;
  calApril: string;
  calMay: string;
  calJune: string;
  calJuly: string;
  calAugust: string;
  calSeptember: string;
  calOctober: string;
  calNovember: string;
  calDecember: string;

  // Privacy notice
  privacyTitle: string;
  privacyIntro: string;
  privacyItem1: string;
  privacyItem2: string;
  privacyItem3: string;
  privacyItem4: string;
  privacyItem5: string;
  privacyItem6: string;
  privacyItem7: string;
  privacyItem8: string;
  privacyHighlight: string;
  privacyAccept: string;

  // Settings
  settingsTitle: string;
  settingsSaved: string;
  settingsRecording: string;
  settingsSamplingRate: string;
  settingsIdleThreshold: string;
  settingsIdleSamplingRate: string;
  settingsDataRetention: string;
  settingsKeepRawData: string;
  settingsRetentionPeriod: string;
  settingsDangerZone: string;
  settingsDeleteAllData: string;
  settingsClearAll: string;
  settingsAbout: string;
  settingsAboutText: string;
  settingsConfirmDelete: string;
  settingsLaunchAtStartup: string;
}

const zh: TranslationDict = {
  navToday: '今日',
  navGallery: '画廊',
  navSettings: '设置',

  themeTerrain: '地形',
  themeInk: '墨迹',
  themeNeon: '霓虹',

  statDistance: '移动距离',
  statActiveTime: '活跃时间',
  statClicks: '点击次数',
  statScrolls: '滚动次数',
  statLongestPause: '最长停留',
  statSamples: '采样点数',

  unitMeters: '米',
  unitKilometers: '公里',
  unitHours: '小时',
  unitMinutes: '分钟',
  unitSeconds: '秒',

  statusRecording: '正在记录',
  statusPaused: '已暂停',
  statusStopped: '已停止',
  statusEmptyRecording: '正在记录...移动鼠标来创作今日指纹',
  statusEmptyPaused: '记录已暂停，在托盘菜单中开始记录',

  liveTitle: '今日',

  galleryTitle: '画廊',
  galleryExport: '导出 PNG',
  galleryDelete: '删除',
  galleryEmpty: '从日历中选择一个日期，查看那天的指纹',

  exportTitle: '导出 PNG',
  exportPrompt: '选择导出分辨率：',
  exportCustom: '自定义',
  exportSetSize: '自定义尺寸',
  exportWidth: '宽度',
  exportHeight: '高度',
  exportBackToPresets: '返回预设',
  exportCancel: '取消',

  calSun: '日',
  calMon: '一',
  calTue: '二',
  calWed: '三',
  calThu: '四',
  calFri: '五',
  calSat: '六',
  calJanuary: '一月',
  calFebruary: '二月',
  calMarch: '三月',
  calApril: '四月',
  calMay: '五月',
  calJune: '六月',
  calJuly: '七月',
  calAugust: '八月',
  calSeptember: '九月',
  calOctober: '十月',
  calNovember: '十一月',
  calDecember: '十二月',

  privacyTitle: '您的隐私，我们守护',
  privacyIntro: 'MotionPrint 是一款注重隐私的鼠标轨迹艺术化工具。在开始之前，请了解数据是如何处理的：',
  privacyItem1: '仅记录鼠标位置、点击和滚轮事件',
  privacyItem2: '绝不记录任何键盘输入',
  privacyItem3: '绝不截取屏幕内容',
  privacyItem4: '不记录窗口标题、应用名称、文件和网页',
  privacyItem5: '所有数据仅存储在本地——无服务器、无云端、无账号',
  privacyItem6: 'MotionPrint 不会发起任何网络请求',
  privacyItem7: '您可以随时删除任意一天的数据',
  privacyItem8: '您可以在设置中关闭原始数据保留',
  privacyHighlight: 'MotionPrint 完全离线运行。您的鼠标指纹只属于您自己，永远不会被发送到任何地方。',
  privacyAccept: '我已知晓——开始记录',

  settingsTitle: '设置',
  settingsSaved: '已保存',
  settingsRecording: '记录',
  settingsSamplingRate: '采样频率 (Hz)',
  settingsIdleThreshold: '空闲阈值 (秒)',
  settingsIdleSamplingRate: '空闲采样频率 (Hz)',
  settingsDataRetention: '数据保留',
  settingsKeepRawData: '保留原始数据',
  settingsRetentionPeriod: '保留天数 (0 = 永久)',
  settingsDangerZone: '危险操作',
  settingsDeleteAllData: '删除所有记录数据',
  settingsClearAll: '清除全部数据',
  settingsAbout: '关于',
  settingsAboutText: 'MotionPrint v1.0.0\n您的每日数字指纹，由鼠标轨迹生成。\n所有数据仅存储在您的电脑上，永不联网。\n使用 Electron、React 和 TypeScript 构建。',
  settingsConfirmDelete: '确认删除所有记录数据？此操作不可撤销。',
  settingsLaunchAtStartup: '开机自启动',
};

const en: TranslationDict = {
  navToday: 'Today',
  navGallery: 'Gallery',
  navSettings: 'Settings',

  themeTerrain: 'Terrain',
  themeInk: 'Ink Wash',
  themeNeon: 'Neon',

  statDistance: 'Distance',
  statActiveTime: 'Active Time',
  statClicks: 'Clicks',
  statScrolls: 'Scrolls',
  statLongestPause: 'Longest Pause',
  statSamples: 'Samples',

  unitMeters: 'm',
  unitKilometers: 'km',
  unitHours: 'h',
  unitMinutes: 'm',
  unitSeconds: 's',

  statusRecording: 'Recording',
  statusPaused: 'Paused',
  statusStopped: 'Stopped',
  statusEmptyRecording: "Recording... move your mouse to create today's fingerprint",
  statusEmptyPaused: 'Recording is paused. Start recording from the tray menu.',

  liveTitle: 'Today',

  galleryTitle: 'Gallery',
  galleryExport: 'Export PNG',
  galleryDelete: 'Delete',
  galleryEmpty: 'Select a date from the calendar to view its fingerprint',

  exportTitle: 'Export PNG',
  exportPrompt: 'Choose a resolution for your export:',
  exportCustom: 'Custom',
  exportSetSize: 'Set size',
  exportWidth: 'Width',
  exportHeight: 'Height',
  exportBackToPresets: 'Back to presets',
  exportCancel: 'Cancel',

  calSun: 'Sun',
  calMon: 'Mon',
  calTue: 'Tue',
  calWed: 'Wed',
  calThu: 'Thu',
  calFri: 'Fri',
  calSat: 'Sat',
  calJanuary: 'January',
  calFebruary: 'February',
  calMarch: 'March',
  calApril: 'April',
  calMay: 'May',
  calJune: 'June',
  calJuly: 'July',
  calAugust: 'August',
  calSeptember: 'September',
  calOctober: 'October',
  calNovember: 'November',
  calDecember: 'December',

  privacyTitle: 'Your Privacy Comes First',
  privacyIntro: 'MotionPrint is designed to be a beautiful, privacy-first mouse tracking app. Before you begin, please understand how your data is handled:',
  privacyItem1: 'Only mouse position, clicks, and scroll wheel events are recorded',
  privacyItem2: 'Keyboard input is never captured or logged',
  privacyItem3: 'No screenshots are taken — ever',
  privacyItem4: 'Window titles, application names, files, and web pages are not tracked',
  privacyItem5: 'All data is stored locally on your computer — no servers, no cloud, no accounts',
  privacyItem6: 'MotionPrint never makes network requests',
  privacyItem7: 'You can delete any day\'s data at any time',
  privacyItem8: 'You can disable raw data retention in Settings',
  privacyHighlight: 'MotionPrint runs entirely offline. Your mouse fingerprint stays on your machine. No data is ever sent anywhere.',
  privacyAccept: 'I Understand — Start Recording',

  settingsTitle: 'Settings',
  settingsSaved: 'Saved',
  settingsRecording: 'Recording',
  settingsSamplingRate: 'Sampling rate (Hz)',
  settingsIdleThreshold: 'Idle threshold (seconds)',
  settingsIdleSamplingRate: 'Idle sampling rate (Hz)',
  settingsDataRetention: 'Data Retention',
  settingsKeepRawData: 'Keep raw data',
  settingsRetentionPeriod: 'Retention period (days, 0 = forever)',
  settingsDangerZone: 'Danger Zone',
  settingsDeleteAllData: 'Delete all recorded data',
  settingsClearAll: 'Clear All Data',
  settingsAbout: 'About',
  settingsAboutText: 'MotionPrint v1.0.0\nYour daily digital fingerprint, generated from mouse movement.\nAll data stays on your computer. No network requests ever.\nBuilt with Electron, React, and TypeScript.',
  settingsConfirmDelete: 'Delete ALL recorded data? This cannot be undone.',
  settingsLaunchAtStartup: 'Launch at system startup',
};

export const translations: Record<Language, TranslationDict> = { zh, en };