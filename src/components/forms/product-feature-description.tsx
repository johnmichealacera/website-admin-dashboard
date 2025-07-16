import { useState, useEffect } from 'react';
import { FeatureName } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ProductFeatureDescriptionProps {
  siteId: string;
  featureName: FeatureName;
}

export function ProductFeatureDescription({ siteId, featureName }: ProductFeatureDescriptionProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDescription() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/site-feature-description?siteId=${siteId}&featureName=${featureName}`);
        const result = await response.json();
        if (result.success) {
          setDescription(result.description || '');
        } else {
          setError(result.error || 'Failed to load feature description');
        }
      } catch (err) {
        setError(`Failed to load feature description: ${err as string}`);
      }
      setLoading(false);
    }
    fetchDescription();
  }, [siteId, featureName]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/site-feature-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, featureName, description }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || 'Failed to update feature description');
      }
    } catch (err) {
      setError(`Failed to update feature description: ${err as string}`);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="feature-description" className="block text-sm font-medium text-gray-700">
        Feature Description
      </label>
      <Textarea
        id="feature-description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Enter a description for this feature (visible to admins)"
        rows={3}
        disabled={loading || saving}
      />
      <div className="flex items-center space-x-2">
        <Button type="button" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        {success && <span className="text-green-600 text-sm">Saved!</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </div>
  );
} 