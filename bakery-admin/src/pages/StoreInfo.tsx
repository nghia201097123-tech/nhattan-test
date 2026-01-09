import { useEffect, useState } from 'react';
import { storeInfoApi } from '../services/api';
import type { StoreInfo as StoreInfoType } from '../types';
import toast from 'react-hot-toast';

const StoreInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StoreInfoType>({
    name: '',
    slogan: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    openingHours: {
      weekdays: '',
      weekend: '',
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      zalo: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await storeInfoApi.get();
      setFormData(data);
    } catch (error) {
      toast.error('Không thể tải thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await storeInfoApi.update(formData);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Thông tin cửa hàng</h1>
        <p className="text-slate-600">Cập nhật thông tin hiển thị trên trang web</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🏪</span> Thông tin cơ bản
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên cửa hàng *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slogan</label>
              <input
                type="text"
                className="input"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
              <textarea
                className="input resize-none"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📞</span> Thông tin liên hệ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                className="input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🕐</span> Giờ mở cửa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thứ 2 - Thứ 6</label>
              <input
                type="text"
                className="input"
                placeholder="7:00 - 21:00"
                value={formData.openingHours.weekdays}
                onChange={(e) => setFormData({
                  ...formData,
                  openingHours: { ...formData.openingHours, weekdays: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thứ 7 - Chủ nhật</label>
              <input
                type="text"
                className="input"
                placeholder="7:00 - 22:00"
                value={formData.openingHours.weekend}
                onChange={(e) => setFormData({
                  ...formData,
                  openingHours: { ...formData.openingHours, weekend: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="card">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>🌐</span> Mạng xã hội
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
              <input
                type="url"
                className="input"
                placeholder="https://facebook.com/..."
                value={formData.socialMedia.facebook || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
              <input
                type="url"
                className="input"
                placeholder="https://instagram.com/..."
                value={formData.socialMedia.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zalo</label>
              <input
                type="url"
                className="input"
                placeholder="https://zalo.me/..."
                value={formData.socialMedia.zalo || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, zalo: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreInfo;
