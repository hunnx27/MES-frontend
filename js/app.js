// ============================================================
// 메인 애플리케이션
// ============================================================
/**
- javascirpt 기본 설정
- 대시보드 최초 로드
- ㄴ KPI 조회
- ㄴ 설비 현황 조회
- ㄴ 알람/로그 조회
- ㄴ PLC 로그 로드
- 이벤트 처리(새로고침 클릭 이벤트 등록)
 */
$(document).ready(function() {
    // 초기 로드
    loadDashboard();
    
    // 자동 새로고침
    setInterval(loadDashboard, CONFIG.REFRESH_INTERVAL);
    
    // 새로고침 버튼
    $('#btn-refresh').click(function() {
        loadDashboard();
    });
});

// ============================================================
// 전체 대시보드 로드
// ============================================================

function loadDashboard() {
    loadKPI();
    loadEquipments();
    loadAlarms();
    loadPlcLogs();
}

// ============================================================
// KPI 로드
// ============================================================

function loadKPI() {
    API.dashboard.getKPI()
        .done(function(data) {
            $('#kpi-alarms').text(Utils.formatNumber(data.activeAlarms || 0));
            $('#kpi-total').text(Utils.formatNumber(data.totalProduction || 0));
            $('#kpi-good').text(Utils.formatNumber(data.goodCount || 0));
            $('#kpi-defect').text(Utils.formatNumber(data.defectCount || 0));
        })
        .fail(function(error) {
            Utils.handleError(error, 'loadKPI');
        });
}

// ============================================================
// 설비 현황 로드
// ============================================================

function loadEquipments() {
    const $container = $('#equipment-container');
    $container.empty();
    
    Object.keys(CONFIG.EQUIPMENT_NAMES).forEach(function(equipId) {
        API.dashboard.getEquipmentDetail(equipId)
            .done(function(data) {
                const card = createEquipmentCard(equipId, data);
                $container.append(card);
            })
            .fail(function(error) {
                Utils.handleError(error, 'loadEquipments - ' + equipId);
            });
    });
}

// ============================================================
// 설비 카드 생성
// ============================================================

function createEquipmentCard(equipId, data) {
    const name = Utils.getEquipmentName(equipId);
    const sensorData = data.sensorData && data.sensorData.length > 0 ? data.sensorData[0] : null;
    const plcLogs = data.plcLogs || [];
    
    // 통계 계산
    let cumulative = 0;
    let good = 0;
    let defect = 0;
    let totalCycle = 0;
    
    if (plcLogs.length > 0) {
        cumulative = plcLogs[0].cumulative || 0;
        plcLogs.forEach(function(log) {
            if (log.isDefect) {
                defect += log.count || 0;
            } else {
                good += log.count || 0;
            }
            totalCycle += log.cycleTime || 0;
        });
    }
    
    const avgCycle = plcLogs.length > 0 ? Utils.formatDecimal(totalCycle / plcLogs.length) : '0.0';
    const defectRate = cumulative > 0 ? Utils.formatDecimal((defect / cumulative) * 100) : '0.0';
    const isRunning = plcLogs.length > 0;
    
    // 센서 데이터 HTML
    let sensorHtml = '';
    if (sensorData) {
        sensorHtml = `
            <div class="row text-center mb-3">
                <div class="col-6 mb-2">
                    <small class="text-muted">온도</small>
                    <div class="sensor-value text-danger">${Utils.formatDecimal(sensorData.temperature)}°C</div>
                </div>
                <div class="col-6 mb-2">
                    <small class="text-muted">압력</small>
                    <div class="sensor-value text-primary">${Utils.formatDecimal(sensorData.pressure)}kPa</div>
                </div>
                <div class="col-6">
                    <small class="text-muted">진동</small>
                    <div class="sensor-value text-warning">${Utils.formatDecimal(sensorData.vibration, 2)}mm/s</div>
                </div>
                <div class="col-6">
                    <small class="text-muted">속도</small>
                    <div class="sensor-value text-success">${Utils.formatNumber(sensorData.speed)}RPM</div>
                </div>
            </div>
        `;
    } else {
        sensorHtml = '<p class="text-center text-muted">센서 데이터 없음</p>';
    }
    
    return `
        <div class="col-md-4">
            <div class="card equipment-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <strong>${name}</strong>
                    <span class="badge ${isRunning ? 'status-running' : 'status-idle'}">
                        ${isRunning ? '가동중' : '정지'}
                    </span>
                </div>
                <div class="card-body">
                    ${sensorHtml}
                    <hr>
                    <div class="row text-center">
                        <div class="col-4">
                            <small class="text-muted">누적</small>
                            <div class="h5 mb-0">${Utils.formatNumber(cumulative)}</div>
                        </div>
                        <div class="col-4">
                            <small class="text-muted">양품</small>
                            <div class="h5 mb-0 text-success">${Utils.formatNumber(good)}</div>
                        </div>
                        <div class="col-4">
                            <small class="text-muted">불량</small>
                            <div class="h5 mb-0 text-danger">${Utils.formatNumber(defect)}</div>
                        </div>
                    </div>
                    <div class="row text-center mt-2">
                        <div class="col-6">
                            <small class="text-muted">불량률</small>
                            <div class="h6 mb-0">${defectRate}%</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">평균 사이클</small>
                            <div class="h6 mb-0">${avgCycle}초</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// 알람 로드
// ============================================================

function loadAlarms() {
    API.alarm.getRecent()
        .done(function(data) {
            const $list = $('#alarm-list');
            $list.empty();
            
            if (Utils.isEmpty(data)) {
                $list.html('<p class="text-center text-muted">알람이 없습니다</p>');
                return;
            }
            
            data.slice(0, 10).forEach(function(alarm) {
                $list.append(createAlarmItem(alarm));
            });
        })
        .fail(function(error) {
            Utils.handleError(error, 'loadAlarms');
        });
}

// ============================================================
// 알람 아이템 생성
// ============================================================

function createAlarmItem(alarm) {
    const levelInfo = Utils.getAlarmLevel(alarm.alarmLevel);
    const resolved = alarm.alarmStatus === 'RESOLVED';
    
    return `
        <div class="alarm-item ${levelInfo.class} ${resolved ? 'opacity-50' : ''}">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <strong><i class="bi ${levelInfo.icon}"></i> ${alarm.alarmLevel}</strong>
                <small class="text-muted">${alarm.equipmentId}</small>
            </div>
            <div class="mb-2">${alarm.alarmMessage}</div>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">${Utils.formatDateTime(alarm.occurredAt)}</small>
                ${!resolved ? `
                <button class="btn btn-sm btn-success" onclick="resolveAlarm(${alarm.alarmId})">
                    <i class="bi bi-check-circle"></i> 해결
                </button>
                ` : '<span class="badge bg-success"><i class="bi bi-check-circle-fill"></i> 해결됨</span>'}
            </div>
        </div>
    `;
}

// ============================================================
// PLC 로그 로드
// ============================================================

function loadPlcLogs() {
    API.plc.getAll()
        .done(function(data) {
            const $list = $('#plc-list');
            $list.empty();
            
            if (Utils.isEmpty(data)) {
                $list.html('<p class="text-center text-muted">생산 로그가 없습니다</p>');
                return;
            }
            
            // 최신순 정렬
            data.sort(function(a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            data.slice(0, 10).forEach(function(log) {
                $list.append(createPlcLogItem(log));
            });
        })
        .fail(function(error) {
            Utils.handleError(error, 'loadPlcLogs');
        });
}

// ============================================================
// PLC 로그 아이템 생성
// ============================================================

function createPlcLogItem(log) {
    const logClass = log.isDefect ? 'plc-defect' : 'plc-good';
    const badge = log.isDefect 
        ? '<span class="badge bg-danger"><i class="bi bi-x-circle"></i> 불량</span>' 
        : '<span class="badge bg-success"><i class="bi bi-check-circle"></i> 양품</span>';
    
    return `
        <div class="plc-log-item ${logClass}">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>${Utils.getEquipmentName(log.equipmentId)}</strong>
                ${badge}
            </div>
            <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">누적:</span>
                <strong>${Utils.formatNumber(log.cumulative)}개</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">사이클:</span>
                <strong>${Utils.formatDecimal(log.cycleTime)}초</strong>
            </div>
            <small class="text-muted">
                <i class="bi bi-clock"></i> ${Utils.formatDateTime(log.timestamp)}
            </small>
        </div>
    `;
}

// ============================================================
// 알람 해결
// ============================================================

function resolveAlarm(alarmId) {
    if (!confirm('이 알람을 해결하시겠습니까?')) {
        return;
    }
    
    API.alarm.resolve(alarmId)
        .done(function() {
            loadAlarms();
            loadKPI();
        })
        .fail(function(error) {
            Utils.handleError(error, 'resolveAlarm');
            alert('알람 해결에 실패했습니다.');
        });
}