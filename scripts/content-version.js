#!/usr/bin/env node
/**
 * 内容版本控制脚本
 * 用于管理和提交内容变更（不包括代码变更）
 * 
 * 使用方法：
 * node scripts/content-version.js commit "添加新日志"
 * node scripts/content-version.js status
 * node scripts/content-version.js log
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 内容目录（只跟踪这些目录的变更）
const CONTENT_DIRS = [
    'data/',
    'images/',
    'hiking/',
    'travel/',
    'cycling/',
    'crocheting/',
    'painting/'
];

// 内容文件扩展名
const CONTENT_EXTENSIONS = [
    '.json',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.md'
];

/**
 * 执行git命令
 */
function git(command) {
    try {
        return execSync(`git ${command}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (error) {
        return null;
    }
}

/**
 * 检查是否是内容文件
 */
function isContentFile(filepath) {
    // 检查扩展名
    const ext = path.extname(filepath).toLowerCase();
    if (!CONTENT_EXTENSIONS.includes(ext)) return false;
    
    // 检查目录
    return CONTENT_DIRS.some(dir => filepath.startsWith(dir));
}

/**
 * 获取内容文件变更列表
 */
function getContentChanges() {
    const status = git('status --porcelain');
    if (!status) return [];
    
    const changes = [];
    status.split('\n').forEach(line => {
        if (!line.trim()) return;
        
        const status = line.substring(0, 2).trim();
        const filepath = line.substring(3).trim();
        
        if (isContentFile(filepath)) {
            changes.push({
                status: status,
                filepath: filepath
            });
        }
    });
    
    return changes;
}

/**
 * 提交内容变更
 */
function commitContent(message) {
    const changes = getContentChanges();
    
    if (changes.length === 0) {
        console.log('✅ 没有内容变更需要提交');
        return;
    }
    
    console.log(`📝 发现 ${changes.length} 个内容文件变更:`);
    changes.forEach(change => {
        console.log(`   ${change.status} ${change.filepath}`);
    });
    
    // 添加内容文件到暂存区
    changes.forEach(change => {
        git(`add "${change.filepath}"`);
    });
    
    // 提交
    const commitMessage = `[内容] ${message}`;
    git(`commit -m "${commitMessage}"`);
    
    console.log(`\n✅ 内容变更已提交: ${commitMessage}`);
}

/**
 * 显示内容变更状态
 */
function showStatus() {
    const changes = getContentChanges();
    
    if (changes.length === 0) {
        console.log('✅ 没有未提交的内容变更');
        return;
    }
    
    console.log(`📝 内容变更状态 (${changes.length} 个文件):\n`);
    
    const grouped = {};
    changes.forEach(change => {
        const statusText = {
            'M': '已修改',
            'A': '新增',
            'D': '已删除',
            'R': '已重命名',
            '??': '未跟踪'
        }[change.status] || change.status;
        
        if (!grouped[statusText]) grouped[statusText] = [];
        grouped[statusText].push(change.filepath);
    });
    
    Object.entries(grouped).forEach(([status, files]) => {
        console.log(`${status}:`);
        files.forEach(f => console.log(`   ${f}`));
        console.log('');
    });
}

/**
 * 显示内容提交历史
 */
function showLog(limit = 10) {
    const log = git(`log --oneline --grep="\\[内容\\]" -n ${limit}`);
    
    if (!log) {
        console.log('暂无内容提交历史');
        return;
    }
    
    console.log(`📜 内容提交历史 (最近 ${limit} 条):\n`);
    console.log(log);
}

/**
 * 主函数
 */
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'commit':
        case 'ci':
            const message = args[1] || '更新内容';
            commitContent(message);
            break;
            
        case 'status':
        case 'st':
            showStatus();
            break;
            
        case 'log':
        case 'history':
            showLog(parseInt(args[1]) || 10);
            break;
            
        case 'help':
        default:
            console.log(`
📚 内容版本控制工具

用法:
    node scripts/content-version.js <命令> [参数]

命令:
    commit <message>  提交内容变更
    status            查看内容变更状态
    log [数量]         查看内容提交历史 (默认10条)
    help              显示帮助信息

示例:
    node scripts/content-version.js commit "添加新日志"
    node scripts/content-version.js status
    node scripts/content-version.js log 20

跟踪目录:
    ${CONTENT_DIRS.join('\n    ')}
            `);
            break;
    }
}

main();
