// ============================================================
// API 통신 모듈
// ============================================================
/**
- AJAX 공통 함수
- Dashboard 조회 API 호출
- Sensor 조회 API 호출
- PLC 조회 API
- Alarm 조회 API
 */
const API = {
    // AJAX 공통 함수
    request: function(url, method = 'GET', data = null) {
        return $.ajax({
            url: CONFIG.API_BASE_URL + url,
            method: method,
            data: data ? JSON.stringify(data) : null,
            contentType: data ? 'application/json' : undefined,
            timeout: 10000,
            error: function(xhr, status, error) {
                Utils.handleError(error, url);
            }
        });
    },

    // ============================================================
    // 대시보드 API
    // ============================================================
    
    dashboard: {
        // KPI 조회
        getKPI: function() {
            return API.request('/dashboard/kpi');
        },
        
        // 설비별 상세 정보
        getEquipmentDetail: function(equipmentId) {
            return API.request('/dashboard/equipment/' + equipmentId);
        }
    },

    // ============================================================
    // 센서 데이터 API
    // ============================================================
    
    sensor: {
        // 최근 데이터 조회
        getRecent: function(equipmentId, limit = 20) {
            return API.request('/sensor/recent/' + equipmentId + '?limit=' + limit);
        },
        
        // 최근 N시간 데이터
        getRecentHours: function(equipmentId, hours) {
            return API.request('/sensor/recent/' + equipmentId + '/hours/' + hours);
        },
        
        // 전체 조회
        getAll: function() {
            return API.request('/sensor/all');
        }
    },

    // ============================================================
    // PLC 생산 로그 API
    // ============================================================
    
    plc: {
        // 최근 로그
        getRecent: function(equipmentId) {
            return API.request('/plc/recent/' + equipmentId);
        },
        
        // 오늘 통계
        getTodayStats: function() {
            return API.request('/plc/stats/today');
        },
        
        // 오늘 로그
        getTodayLogs: function(equipmentId) {
            return API.request('/plc/today/' + equipmentId);
        },
        
        // 전체 조회
        getAll: function() {
            return API.request('/plc/all');
        }
    },

    // ============================================================
    // 알람 API
    // ============================================================
    
    alarm: {
        // 활성 알람
        getActive: function() {
            return API.request('/alarm/active');
        },
        
        // 설비별 활성 알람
        getActiveByEquipment: function(equipmentId) {
            return API.request('/alarm/active/' + equipmentId);
        },
        
        // 최근 알람
        getRecent: function() {
            return API.request('/alarm/recent');
        },
        
        // 알람 해결
        resolve: function(alarmId) {
            return API.request('/alarm/' + alarmId + '/resolve', 'PUT');
        },
        
        // 활성 알람 개수
        getActiveCount: function() {
            return API.request('/alarm/count/active');
        },
        
        // 전체 조회
        getAll: function() {
            return API.request('/alarm/all');
        }
    }
};