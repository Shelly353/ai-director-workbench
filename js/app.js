const API_BASE = "https://proxy-server-us-it0u.onrender.com";
const ACCESS_CODE = "dajingdongqu";

// ==========================================
// 🌟 核心升级：IndexedDB 无限容量本地数据库
// ==========================================
const DB = {
    dbName: 'AIDirector_Ultimate_DB',
    storeName: 'assets_store',
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },
    
    async get(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },
    
    async set(key, value) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    
    async remove(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};

// 全局 API 请求封装
async function apiRequest(endpoint, body) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'x-access-code': ACCESS_CODE 
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    } catch (e) {
        log(`❌ API 请求失败: ${e.message}`);
        throw e;
    }
}

// 底部日志打印功能
function log(msg) {
    const consoleEl = document.getElementById('logConsole');
    if (consoleEl) {
        const time = new Date().toLocaleTimeString();
        consoleEl.innerText += `[${time}] ${msg}\n`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
}

// 全局上传图片功能
let fileUploadCallback = null;
function triggerUpload(callback) {
    fileUploadCallback = callback;
    let uploader = document.getElementById('globalFileUploader');
    if (!uploader) {
        uploader = document.createElement('input');
        uploader.type = 'file';
        uploader.id = 'globalFileUploader';
        uploader.accept = 'image/*';
        uploader.style.display = 'none';
        document.body.appendChild(uploader);
        
        uploader.addEventListener('change', function(e) {
            if (e.target.files[0]) {
                const r = new FileReader();
                r.onload = (ev) => {
                    if (fileUploadCallback) fileUploadCallback(ev.target.result);
                    uploader.value = ""; 
                };
                r.readAsDataURL(e.target.files[0]);
            }
        });
    }
    uploader.click();
}