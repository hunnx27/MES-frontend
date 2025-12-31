// ============================================================
// 설정 파일
// ============================================================
/** 
- API URL 정의
- 설비 이름 매핑 설정
- 알람 레벨 설정
- 유틸리티 함수 (날짜, 숫자 포맷) 정의
*/
const CONFIG = {
    // API 기본 URL
    API_BASE_URL: 'http://localhost:8080/api',
    
    // 자동 새로고침 간격 (밀리초)
    REFRESH_INTERVAL: 5000, // 5초
    
    // 설비 이름 매핑
    EQUIPMENT_NAMES: {
        'EQ-001': '조립 라인 1',
        'EQ-002': '검사 장비 1',
        'EQ-003': '포장 라인 1'
    },
    
    // 알람 레벨 색상
    ALARM_LEVELS: {
        'CRITICAL': {
            class: 'alarm-critical',
            color: '#dc3545',
            icon: 'bi-exclamation-triangle-fill'
        },
        'WARNING': {
            class: 'alarm-warning',
            color: '#ffc107',
            icon: 'bi-exclamation-circle-fill'
        },
        'INFO': {
            class: 'alarm-info',
            color: '#17a2b8',
            icon: 'bi-info-circle-fill'
        }
    },
    
    // 상태 색상
    STATUS_COLORS: {
        'RUNNING': 'status-running',
        'IDLE': 'status-idle'
    }
};

// 유틸리티 함수
const Utils = {
    // 날짜 포맷팅
    formatDateTime: function(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    // 숫자 포맷팅 (천단위 콤마)
    formatNumber: function(num) {
        if (num === null || num === undefined) return 0;
        return num.toLocaleString('ko-KR');
    },
    
    // 소수점 포맷팅
    formatDecimal: function(num, decimals = 1) {
        if (num === null || num === undefined) return '0.0';
        return parseFloat(num).toFixed(decimals);
    },
    
    // 설비 이름 가져오기
    getEquipmentName: function(equipmentId) {
        return CONFIG.EQUIPMENT_NAMES[equipmentId] || equipmentId;
    },
    
    // 알람 레벨 정보 가져오기
    getAlarmLevel: function(level) {
        return CONFIG.ALARM_LEVELS[level] || CONFIG.ALARM_LEVELS['INFO'];
    },
    
    // 에러 처리
    handleError: function(error, context) {
        console.error(`[${context}] Error:`, error);
        // 필요시 사용자에게 알림 표시
    },
    
    // 빈 데이터 확인
    isEmpty: function(data) {
        return !data || (Array.isArray(data) && data.length === 0);
    }
};