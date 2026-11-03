// =============================================================================
// CẤU HÌNH TRUNG TÂM (SUPABASE & LINK ẢNH TỐT NGHIỆP)
// Điền SUPABASE_URL và SUPABASE_ANON_KEY của bạn vào dưới đây (hoặc nhập trực
// tiếp trên giao diện trang Quản Lý Thiệp /quan-ly-thiep.html).
// =============================================================================

window.APP_CONFIG = {
  // 1. Thông tin Project Supabase (Lấy tại: Supabase Dashboard -> Project Settings -> API)
  SUPABASE_URL: "https://hirgygdkfxvrerevqvha.supabase.co",      // VD: "https://abcdefghijklm.supabase.co"
  SUPABASE_ANON_KEY: "sb_publishable_aziu-cnFEApamBrfZaswag_u6KLuuy2", // VD: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  // 2. Link Google Drive / OneDrive nhận ảnh sau lễ tốt nghiệp (Có thể sửa trực tiếp trên trang Quản Lý)
  DEFAULT_PHOTO_DRIVE_URL: ""
};

// =============================================================================
// SUPABASE CLOUD & LOCALSTORAGE SYNC CLIENT
// Tự động đồng bộ lên Supabase nếu đã cấu hình, đồng thời lưu dự phòng ở máy
// =============================================================================
window.ZunzunDB = {
  STORAGE_KEYS: {
    SUPABASE_URL: 'hmd_sb_url_2026',
    SUPABASE_KEY: 'hmd_sb_key_2026',
    GUESTS: 'hmd_managed_guests_2026',
    WISHES: 'hmd_private_inbox_2026',
    PHOTO_URL: 'hmd_photo_drive_url_2026',
    BASE_URL: 'hmd_invitation_base_url_2026'
  },

  getCredentials() {
    const url = (window.APP_CONFIG.SUPABASE_URL || localStorage.getItem(this.STORAGE_KEYS.SUPABASE_URL) || '').trim().replace(/\/$/, '');
    const key = (window.APP_CONFIG.SUPABASE_ANON_KEY || localStorage.getItem(this.STORAGE_KEYS.SUPABASE_KEY) || '').trim();
    return { url, key, isConfigured: Boolean(url && key) };
  },

  saveCredentials(url, key) {
    localStorage.setItem(this.STORAGE_KEYS.SUPABASE_URL, (url || '').trim().replace(/\/$/, ''));
    localStorage.setItem(this.STORAGE_KEYS.SUPABASE_KEY, (key || '').trim());
  },

  headers(extra = {}) {
    const { key } = this.getCredentials();
    return {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...extra
    };
  },

  // --- WISHES (ĐÔI LỜI THẦM KÍN GỬI ZUNZUN) ---
  async sendWish(guestName, message) {
    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const localEntry = {
      type: 'wish',
      guest: guestName,
      msg: message,
      time: timeLabel,
      created_at: now.toISOString()
    };

    // Save locally as backup
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.WISHES);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(localEntry);
      localStorage.setItem(this.STORAGE_KEYS.WISHES, JSON.stringify(list));
    } catch (e) {}

    // Save to Supabase if configured
    const { url, isConfigured } = this.getCredentials();
    if (isConfigured) {
      const res = await fetch(`${url}/rest/v1/wishes`, {
        method: 'POST',
        headers: this.headers({ 'Prefer': 'return=minimal' }),
        body: JSON.stringify({
          guest_name: guestName,
          message: message
        })
      });
      if (!res.ok) throw new Error('Supabase insert wish failed');
    }
    return localEntry;
  },

  async fetchWishes() {
    const { url, isConfigured } = this.getCredentials();
    if (isConfigured) {
      try {
        const res = await fetch(`${url}/rest/v1/wishes?select=*&order=created_at.desc`, {
          headers: this.headers()
        });
        if (res.ok) {
          const rows = await res.json();
          return rows.map(r => {
            const d = new Date(r.created_at);
            const timeStr = isNaN(d.getTime())
              ? ''
              : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} · ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            return {
              id: r.id,
              guest: r.guest_name,
              msg: r.message,
              time: timeStr
            };
          });
        }
      } catch (e) {}
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.WISHES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(w => !w.type || w.type === 'wish');
      }
    } catch (e) {}
    return [];
  },

  // --- GUESTS (DANH SÁCH KHÁCH MỜI & LINK THIỆP) ---
  async fetchGuests() {
    const { url, isConfigured } = this.getCredentials();
    if (isConfigured) {
      try {
        const res = await fetch(`${url}/rest/v1/guests?select=*&order=created_at.desc`, {
          headers: this.headers()
        });
        if (res.ok) {
          const rows = await res.json();
          localStorage.setItem(this.STORAGE_KEYS.GUESTS, JSON.stringify(rows));
          return rows;
        }
      } catch (e) {}
    }
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.GUESTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  },

  async addGuests(guestsArray) {
    const { url, isConfigured } = this.getCredentials();
    // Update local cache
    let localList = [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.GUESTS);
      if (raw) localList = JSON.parse(raw);
    } catch (e) {}
    const updated = [...guestsArray, ...localList];
    try {
      localStorage.setItem(this.STORAGE_KEYS.GUESTS, JSON.stringify(updated));
    } catch (e) {}

    if (isConfigured) {
      try {
        await fetch(`${url}/rest/v1/guests`, {
          method: 'POST',
          headers: this.headers({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
          body: JSON.stringify(guestsArray.map(g => ({
            id: g.id,
            name: g.name,
            pose: g.pose || 'card1',
            sent: Boolean(g.sent)
          })))
        });
      } catch (e) {}
    }
    return updated;
  },

  async updateGuest(id, patch) {
    const { url, isConfigured } = this.getCredentials();
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.GUESTS);
      if (raw) {
        const list = JSON.parse(raw).map(g => g.id === id ? { ...g, ...patch } : g);
        localStorage.setItem(this.STORAGE_KEYS.GUESTS, JSON.stringify(list));
      }
    } catch (e) {}

    if (isConfigured) {
      try {
        await fetch(`${url}/rest/v1/guests?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: this.headers({ 'Prefer': 'return=minimal' }),
          body: JSON.stringify(patch)
        });
      } catch (e) {}
    }
  },

  async deleteGuest(id) {
    const { url, isConfigured } = this.getCredentials();
    try {
      const raw = localStorage.getItem(this.STORAGE_KEYS.GUESTS);
      if (raw) {
        const list = JSON.parse(raw).filter(g => g.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.GUESTS, JSON.stringify(list));
      }
    } catch (e) {}

    if (isConfigured) {
      try {
        await fetch(`${url}/rest/v1/guests?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: this.headers()
        });
      } catch (e) {}
    }
  },

  // --- PHOTO DRIVE URL SETTING ---
  async getPhotoDriveUrl() {
    if (window.APP_CONFIG.DEFAULT_PHOTO_DRIVE_URL) {
      return window.APP_CONFIG.DEFAULT_PHOTO_DRIVE_URL;
    }
    const { url, isConfigured } = this.getCredentials();
    if (isConfigured) {
      try {
        const res = await fetch(`${url}/rest/v1/app_settings?key=eq.photo_drive_url&select=value`, {
          headers: this.headers()
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows.length > 0 && rows[0].value) {
            localStorage.setItem(this.STORAGE_KEYS.PHOTO_URL, rows[0].value);
            return rows[0].value;
          }
        }
      } catch (e) {}
    }
    return localStorage.getItem(this.STORAGE_KEYS.PHOTO_URL) || '';
  },

  async setPhotoDriveUrl(driveUrl) {
    const clean = (driveUrl || '').trim();
    localStorage.setItem(this.STORAGE_KEYS.PHOTO_URL, clean);
    const { url, isConfigured } = this.getCredentials();
    if (isConfigured) {
      await fetch(`${url}/rest/v1/app_settings`, {
        method: 'POST',
        headers: this.headers({ 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify({
          key: 'photo_drive_url',
          value: clean,
          updated_at: new Date().toISOString()
        })
      });
    }
  }
};
