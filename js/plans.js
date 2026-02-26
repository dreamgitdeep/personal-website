/**
 * 计划页面专用脚本
 * 计划数据直接嵌入，无需服务器即可运行
 */

// ========== 计划数据（直接嵌入，可直接双击HTML打开） ==========
const plansData = {
    "version": "1.0",
    "lastUpdated": "2026-02-26",
    "plans": {
        "short-term": [
            {
                "id": "plan-short-1",
                "title": "准备预答辩相关工作",
                "description": "整理答辩材料，准备PPT演示",
                "progress": 30,
                "status": "in-progress",
                "priority": 5
            },
            {
                "id": "plan-short-2",
                "title": "调整毕业论文相关格式",
                "description": "按照学校要求规范论文格式",
                "progress": 20,
                "status": "in-progress",
                "priority": 4
            },
            {
                "id": "plan-short-3",
                "title": "完成教资申报的工作",
                "description": "准备申报材料并提交审核",
                "progress": 10,
                "status": "in-progress",
                "priority": 4
            }
        ],
        "medium-term": [
            {
                "id": "plan-medium-1",
                "title": "持续学习人工智能技术",
                "description": "做出一到两个成果",
                "progress": 20,
                "status": "in-progress",
                "priority": 5
            },
            {
                "id": "plan-medium-2",
                "title": "持续维护与更新个人网页",
                "description": "并推广分享经验",
                "progress": 30,
                "status": "in-progress",
                "priority": 4
            },
            {
                "id": "plan-medium-3",
                "title": "阅读1本书",
                "description": "拓展知识面，提升自我",
                "progress": 0,
                "status": "in-progress",
                "priority": 3
            }
        ],
        "long-term": [
            {
                "id": "plan-long-1",
                "title": "坚持锻炼",
                "description": "增肌塑形，保持健康体魄",
                "progress": 10,
                "status": "in-progress",
                "priority": 5
            },
            {
                "id": "plan-long-2",
                "title": "关注时事",
                "description": "保持对社会动态的敏感度",
                "progress": 20,
                "status": "in-progress",
                "priority": 4
            },
            {
                "id": "plan-long-3",
                "title": "勤思考勤记录",
                "description": "养成记录生活与思考的习惯",
                "progress": 15,
                "status": "in-progress",
                "priority": 5
            }
        ]
    },
    "stats": {
        "totalGoals": 9,
        "completed": 0,
        "inProgress": 9,
        "pending": 0,
        "completionRate": 14
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 渲染各类型计划
    renderPlans('short-term', plansData.plans['short-term']);
    renderPlans('medium-term', plansData.plans['medium-term']);
    renderPlans('long-term', plansData.plans['long-term']);
    
    // 更新统计数据
    updateStats();
    
    // 初始化动画
    initGoalCardsAnimation();
    
    console.log('✅ 计划数据加载成功');
});

/**
 * 渲染计划列表
 * @param {string} type - 计划类型
 * @param {Array} plans - 计划数组
 */
function renderPlans(type, plans) {
    const list = document.querySelector(`.goal-column.${type} .goal-list`);
    
    if (!list) return;
    
    // 清空现有内容
    list.innerHTML = '';
    
    // 按优先级和进度排序
    const sortedPlans = [...plans].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return b.priority - a.priority;
    });
    
    // 渲染每个计划卡片
    sortedPlans.forEach((plan, index) => {
        const card = createPlanCard(plan);
        list.appendChild(card);
        
        // 延迟添加动画类
        setTimeout(() => {
            card.classList.add('show');
        }, index * 100);
    });
}

/**
 * 创建计划卡片元素
 * @param {Object} plan - 计划数据
 * @returns {HTMLElement}
 */
function createPlanCard(plan) {
    const div = document.createElement('div');
    div.className = `goal-card ${plan.status === 'completed' ? 'completed' : ''}`;
    div.dataset.id = plan.id;
    
    div.innerHTML = `
        <div class="goal-checkbox ${plan.status === 'completed' ? 'checked' : ''}">
            <i class="fas fa-check"></i>
        </div>
        <div class="goal-content">
            <h4>${plan.title}</h4>
            <p>${plan.description || ''}</p>
            <div class="goal-progress">
                <div class="progress-fill" style="width: ${plan.progress}%"></div>
            </div>
            <div class="goal-meta">
                <span class="goal-progress-text">${plan.progress}%</span>
                ${plan.deadline ? `<span class="goal-deadline"><i class="far fa-calendar"></i> ${plan.deadline}</span>` : ''}
            </div>
        </div>
    `;
    
    return div;
}

/**
 * 更新统计数据
 */
function updateStats() {
    const stats = plansData.stats;
    
    // 更新页面上的统计数字
    const statCards = document.querySelectorAll('.stats-grid .stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('.stat-value').textContent = stats.completed || 0;
        statCards[1].querySelector('.stat-value').textContent = stats.inProgress || 0;
        statCards[2].querySelector('.stat-value').textContent = stats.pending || 0;
        statCards[3].querySelector('.stat-value').textContent = `${stats.completionRate || 0}%`;
    }
}

/**
 * 初始化目标卡片动画
 */
function initGoalCardsAnimation() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('show');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有卡片
    document.querySelectorAll('.goal-card').forEach(card => {
        observer.observe(card);
    });
}
