import type { Device, DeviceStatus } from "./schema";

const MODELS = [
  "EdgeNode X1",
  "EdgeNode X2",
  "Gateway G3",
  "Sensor S5",
  "Relay Hub H7",
];
const LOCATIONS = ["us-east", "us-west", "eu-central", "ap-south", "sa-east"];

const DEVICE_COUNT = 10000;

function statusFor(i: number): DeviceStatus {
  if (i % 19 === 0) return "offline";
  if (i % 7 === 0) return "degraded";
  return "online";
}

/** Generated, not hand-written — a fleet large enough to need virtualization. */
export const demoDevices: Device[] = Array.from(
  { length: DEVICE_COUNT },
  (_, i) => ({
    id: `dev_${10000 + i}`,
    name: `edge-${String(i + 1).padStart(4, "0")}`,
    model: MODELS[i % MODELS.length],
    status: statusFor(i),
    location: LOCATIONS[i % LOCATIONS.length],
    firmware: `v${2 + (i % 3)}.${i % 10}.${i % 6}`,
    uptime: 90 + ((i * 7) % 10) + (i % 2 === 0 ? 0 : 0.5),
    createdAt: new Date(2025, 0, 1),
    updatedAt: new Date(2026, 5, 1),
  }),
);
