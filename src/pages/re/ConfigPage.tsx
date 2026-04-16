import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Bell, Building2, Save, Copy, Download, Smartphone, Truck, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { areas, teamSchedule, vehicleTemplate } from "@/mock/re-config";
import { areaLoad } from "@/mock/re-dashboard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* Leaflet dynamic import to avoid SSR issues */
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const dayLabels: Record<string, string> = {
  Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN",
};
const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Click handler component for map */
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/**
 * ConfigPage — Work Area config with Leaflet map, team schedule, vehicle template, RE info, PWA.
 */
const ConfigPage: React.FC = () => {
  const [areaConfigs, setAreaConfigs] = useState(
    areas.map(a => ({ ...a }))
  );
  const [collectionTime, setCollectionTime] = useState(teamSchedule.collectionTime);
  const [dispatchTime, setDispatchTime] = useState(teamSchedule.dispatchTime);
  const [autoNotify, setAutoNotify] = useState(teamSchedule.overflowAutoNotify);
  const [vehicle, setVehicle] = useState({ ...vehicleTemplate });
  const [reName, setReName] = useState("Xanh Môi Trường Co.");
  const [reEmail, setReEmail] = useState("leminh@xanhmt.vn");
  const [rePhone, setRePhone] = useState("0901234567");
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0].id);

  const selectedArea = areaConfigs.find(a => a.id === selectedAreaId)!;

  const updateArea = (id: string, patch: Partial<typeof areas[0]>) => {
    setAreaConfigs(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
    toast.success("Đã lưu cấu hình");
  };

  const copyLink = () => {
    navigator.clipboard.writeText("ecoconnect.app/re");
    toast.success("Đã sao chép link");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-heading font-bold text-foreground">Cấu hình hệ thống</h1>

      {/* Section 1: Work Area Setup with Map */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Cấu hình Khu vực (Work Area)
        </h2>

        {/* Area selector tabs */}
        <div className="flex gap-2 mb-4">
          {areaConfigs.map(area => (
            <Button
              key={area.id}
              variant={selectedAreaId === area.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAreaId(area.id)}
            >
              {area.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Map */}
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <div className="h-[320px] relative">
                <MapContainer
                  key={selectedAreaId}
                  center={[selectedArea.lat, selectedArea.lng]}
                  zoom={15}
                  className="h-full w-full z-0"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[selectedArea.lat, selectedArea.lng]} icon={defaultIcon} />
                  <Circle
                    center={[selectedArea.lat, selectedArea.lng]}
                    radius={selectedArea.radiusKm * 1000}
                    pathOptions={{ color: "oklch(0.52 0.17 152)", fillOpacity: 0.15 }}
                  />
                  <MapClickHandler
                    onMapClick={(lat, lng) => {
                      updateArea(selectedAreaId, { lat, lng });
                    }}
                  />
                </MapContainer>
              </div>
              <p className="text-xs text-muted-foreground p-2">Click trên bản đồ để chọn tọa độ trụ sở</p>
            </CardContent>
          </Card>

          {/* Area config form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">{selectedArea.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Địa chỉ trung tâm</Label>
                <Input
                  value={selectedArea.centerAddress}
                  onChange={e => updateArea(selectedAreaId, { centerAddress: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Vĩ độ (Lat)</Label>
                  <Input value={selectedArea.lat.toFixed(4)} readOnly className="mt-1 font-mono text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Kinh độ (Lng)</Label>
                  <Input value={selectedArea.lng.toFixed(4)} readOnly className="mt-1 font-mono text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Bán kính (km)</Label>
                  <Input
                    type="number" step="0.1"
                    value={selectedArea.radiusKm}
                    onChange={e => updateArea(selectedAreaId, { radiusKm: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ngưỡng overflow (túi)</Label>
                  <Input
                    type="number"
                    value={selectedArea.threshold}
                    onChange={e => updateArea(selectedAreaId, { threshold: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Sức chứa tối đa (m³)</Label>
                  <Input
                    type="number"
                    value={selectedArea.maxCapacityM3}
                    onChange={e => updateArea(selectedAreaId, { maxCapacityM3: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sức chứa tối đa (kg)</Label>
                  <Input
                    type="number"
                    value={selectedArea.maxCapacityKg}
                    onChange={e => updateArea(selectedAreaId, { maxCapacityKg: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Load status */}
              {(() => {
                const load = areaLoad.find(a => a.area === selectedArea.name);
                const active = load?.active || 0;
                const pct = Math.round((active / selectedArea.threshold) * 100);
                return (
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs">
                      <span>Tải hôm nay: {active}/{selectedArea.threshold}</span>
                      <span className={cn(pct >= 90 ? "text-destructive font-bold" : "")}>{pct}%</span>
                    </div>
                    <Progress value={pct} className={cn("h-2", pct >= 90 && "[&>div]:bg-destructive")} />
                  </div>
                );
              })()}

              {/* Team leads */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <Label className="text-xs">Team 1 Lead</Label>
                  <Input
                    value={selectedArea.team1Lead}
                    onChange={e => updateArea(selectedAreaId, { team1Lead: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Team 2 Lead</Label>
                  <Input
                    value={selectedArea.team2Lead}
                    onChange={e => updateArea(selectedAreaId, { team2Lead: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 2: Vehicle Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Truck className="w-4 h-4" /> Phương tiện (Vehicle Template)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">1 mẫu phương tiện chung cho toàn Enterprise (MVP)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Tên phương tiện</Label>
              <Input value={vehicle.name} onChange={e => { setVehicle(v => ({ ...v, name: e.target.value })); setHasChanges(true); }} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Dung tích (m³)</Label>
              <Input type="number" value={vehicle.maxVolumeM3} onChange={e => { setVehicle(v => ({ ...v, maxVolumeM3: parseFloat(e.target.value) || 0 })); setHasChanges(true); }} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Tải trọng (kg)</Label>
              <Input type="number" value={vehicle.maxWeightKg} onChange={e => { setVehicle(v => ({ ...v, maxWeightKg: parseFloat(e.target.value) || 0 })); setHasChanges(true); }} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Team Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Lịch thu gom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {allDays.map((day) => {
              const isTeam1 = teamSchedule.team1Days.includes(day);
              const isTeam2 = teamSchedule.team2Days.includes(day);
              const isSunday = day === "Sun";
              return (
                <div
                  key={day}
                  className={cn(
                    "text-center p-3 rounded-lg border text-sm font-medium transition-colors",
                    isTeam1 && "bg-primary/10 border-primary/30 text-primary",
                    isTeam2 && "bg-accent/30 border-accent/30 text-accent-foreground",
                    isSunday && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  <p className="text-xs">{dayLabels[day]}</p>
                  <p className="text-[10px] mt-1">
                    {isTeam1 ? "Team 1" : isTeam2 ? "Team 2" : "Nghỉ"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Giờ thu gom:</span>
              <Input
                value={collectionTime}
                onChange={e => { setCollectionTime(e.target.value); setHasChanges(true); }}
                className="w-24 h-8 text-sm text-center font-heading font-bold"
              />
            </div>
            <div className="flex items-center gap-3">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Giờ xuất binh:</span>
              <Input
                value={dispatchTime}
                onChange={e => { setDispatchTime(e.target.value); setHasChanges(true); }}
                className="w-24 h-8 text-sm text-center font-heading font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Tự động thông báo overflow</span>
            </div>
            <Switch checked={autoNotify} onCheckedChange={v => { setAutoNotify(v); setHasChanges(true); }} />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: RE Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Thông tin RE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Tên doanh nghiệp</Label>
            <Input value={reName} onChange={e => { setReName(e.target.value); setHasChanges(true); }} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={reEmail} onChange={e => { setReEmail(e.target.value); setHasChanges(true); }} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Số điện thoại</Label>
              <Input value={rePhone} onChange={e => { setRePhone(e.target.value); setHasChanges(true); }} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <motion.div animate={hasChanges ? { scale: [1, 1.02, 1] } : {}} transition={{ repeat: hasChanges ? Infinity : 0, duration: 1.5 }}>
        <Button onClick={handleSave} disabled={!hasChanges} className="w-full h-11">
          <Save className="w-4 h-4 mr-2" /> Lưu tất cả thay đổi
        </Button>
      </motion.div>

      {/* PWA sharing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Chia sẻ ứng dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted shrink-0">
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i) ? "bg-foreground" : "bg-transparent"}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground">ecoconnect.app/re</p>
              <p className="text-xs text-muted-foreground">Quét mã QR hoặc chia sẻ link để cài đặt ứng dụng.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyLink} className="h-8 text-xs">
                  <Copy className="w-3 h-3 mr-1" /> Sao chép
                </Button>
                <Button size="sm" className="h-8 text-xs">
                  <Download className="w-3 h-3 mr-1" /> Cài đặt
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigPage;
