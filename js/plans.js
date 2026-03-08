/**
 * 计划页面专用脚本
 * 计划数据直接嵌入，无需服务器即可运行
 */

// ========== 计划数据（直接嵌入，可直接双击HTML打开） ==========
const plansData = {
    "version": "1.0",
    "lastUpdated": "2026-03-08",
    "plans": {
        "short-term": [
            {
                "id": "plan-short-1",
                "title": "准备预答辩相关工作",
                "description": "整理答辩材料，准备PPT演示 ✅ 已完成",
                "progress": 100,
                "status": "completed",
                "priority": 5
            },
            {
                "id": "plan-short-2",
                "title": "调整毕业论文相关格式",
                "description": "按照学校要求规范论文格式（已完成90%）",
                "progress": 90,
                "status": "in-progress",
                "priority": 5
            },
            {
                "id": "plan-short-3",
                "title": "完成教资申报的工作",
                "description": "准备申报材料并提交审核 ✅ 已完成",
                "progress": 100,
                "status": "completed",
                "priority": 4
            },
            {
                "id": "plan-short-4",
                "title": "完成毕业论文，定终稿",
                "description": "根据专家意见修改完善，确定最终版本",
                "progress": 30,
                "status": "in-progress",
                "priority": 5
            },
            {
                "id": "plan-short-5",
                "title": "学习事业编制",
                "description": "了解事业编考试内容，准备备考",
                "progress": 10,
                "status": "in-progress",
                "priority": 4
            }
        ],
        "medium-term": [
            {
                "id": "plan-medium-1",
                "title": "公众号粉丝突破1万",
                "description": "持续输出优质内容",
                "progress": 45,
                "status": "in-progress",
                "priority": 4
            },
            {
                "id": "plan-medium-2",
                "title": "掌握一门新技能",
                "description": "学习视频剪辑或设计",
                "progress": 30,
                "status": "in-progress",
                "priority": 3
            },
            {
                "id": "plan-medium-3",
                "title": "坚持健身一年",
                "description": "每周运动3次以上",
                "progress": 25,
                "status": "in-progress",
                "priority": 4
            },
            {
                "id": "plan-medium-4",
                "title": "去3个新城市旅行",
                "description": "探索不同的地方和文化",
                "progress": 33,
                "status": "in-progress",
                "priority": 3
            }
        ],
        "long-term": [
            {
                "id": "plan-long-1",
                "title": "成为资深内容运营",
                "description": "在内容领域深耕，成为专家",
                "progress": 20,
                "status": "in-progress",
                "priority": 5
            },
            {
                "id": "plan-long-2",
                "title": "出版自己的作品",
                "description": "写一本属于自己的书",
                "progress": 10,
                "status": "in-progress",
                "priority": 4
            },
            {
                "id": "plan-long-3",
                "title": "实现财务自由",
                "description": "通过副业和投资增加收入",
                "progress": 15,
                "status": "in-progress",
                "priority": 5
            },
            {
                "id": "plan-long-4",
                "title": "环游中国",
                "description": "走遍祖国的大好河山",
                "progress": 5,
                "status": "in-progress",
                "priority": 4
            }
        ]
    },
    "stats": {
        "totalGoals": 13,
        "completed": 2,
        "inProgress": 11,
        "pending": 0,
        "completionRate": 15
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
