import { notFound } from 'next/navigation';
import { TOOLS } from './tools-registry';
import { ToolDetail } from './tool-detail';

export function generateStaticParams() {
  return Object.keys(TOOLS).map((id) => ({ id }));
}

export default function ToolDetailPage({ params }: { params: { id: string } }) {
  const tool = TOOLS[params.id];
  if (!tool) notFound();
  return <ToolDetail tool={tool} />;
}
