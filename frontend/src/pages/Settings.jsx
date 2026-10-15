import React from 'react';
import PageContainer from '../components/layout/PageContainer.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export const Settings = () => {
  return (
    <PageContainer
      title="Settings & Workspace Configuration"
      subtitle="Manage team preferences, API connections, and export settings."
      badge={<Badge variant="mint" size="sm">Workspace</Badge>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="white" radius="lg" className="space-y-4">
          <h3 className="text-sm font-bold text-[#051F20]">Backend API Connection</h3>
          <p className="text-xs text-[#71877E]">
            HackMentor currently operates in Local Mock mode with realistic API response delays. Connect an active backend endpoint if available.
          </p>
          <Input
            label="API Base URL (VITE_API_URL)"
            placeholder="http://localhost:8000"
            defaultValue={import.meta.env.VITE_API_URL || ''}
            helperText="Leave empty to use built-in structured mock datasets."
          />
          <Button variant="primary" size="sm">
            Save Configuration
          </Button>
        </Card>

        <Card variant="white" radius="lg" className="space-y-4">
          <h3 className="text-sm font-bold text-[#051F20]">Environment & Model</h3>
          <div className="text-xs space-y-2 text-[#49645C]">
            <div className="flex justify-between py-1 border-b border-[#DAF1DE]">
              <span className="font-medium">Active Model</span>
              <span className="font-bold text-[#051F20]">Gemini 3.8 Flash (High)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#DAF1DE]">
              <span className="font-medium">Hackathon Event</span>
              <span className="font-bold text-[#051F20]">TCS Hackathon 2026</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#DAF1DE]">
              <span className="font-medium">Mode</span>
              <span className="font-bold text-[#4F8A6A]">Local In-Memory Mock Active</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Settings;
