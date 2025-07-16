// src/app/api/site-feature-description/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSiteFeatureDescription, updateSiteFeatureDescription } from '@/lib/actions/site-features';
import { FeatureName } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId');
  const featureName: FeatureName = searchParams.get('featureName') as FeatureName;
  if (!siteId || !featureName) {
    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
  }
  const result = await getSiteFeatureDescription(siteId, featureName);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { siteId, featureName, description } = await req.json();
  if (!siteId || !featureName) {
    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
  }
  const result = await updateSiteFeatureDescription(siteId, featureName, description);
  return NextResponse.json(result);
}