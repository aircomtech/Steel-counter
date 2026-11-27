import ContourWebsiteClient from "@/components/ContourWebsiteClient";
import { getPublishedSiteData } from "@/lib/cms/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const siteData = await getPublishedSiteData();
  return <ContourWebsiteClient initialData={siteData} />;
}
