import { Smartphone, Tablet } from 'lucide-react';
import { Button } from './ui/button';

interface DeviceSelectorProps {
  deviceType: 'tablet' | 'smartphone';
  setDeviceType: (type: 'tablet' | 'smartphone') => void;
}

export function DeviceSelector({ deviceType, setDeviceType }: DeviceSelectorProps) {
  return (
    <div className="bg-white border-b border-neutral-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-end">
        <div className="flex gap-2">
          <Button
            variant={deviceType === 'tablet' ? 'default' : 'outline'}
            onClick={() => setDeviceType('tablet')}
            className="flex items-center gap-2"
          >
            <Tablet className="w-4 h-4" />
            Tablette
          </Button>
          <Button
            variant={deviceType === 'smartphone' ? 'default' : 'outline'}
            onClick={() => setDeviceType('smartphone')}
            className="flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Smartphone
          </Button>
        </div>
      </div>
    </div>
  );
}