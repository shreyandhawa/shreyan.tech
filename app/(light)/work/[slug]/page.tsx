const slugs = ["lumencell", "arohexis", "nosolear", "trustory", "resauce"];

export const dynamicParams = false;
export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export default async function Project({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  return <h1>{slug}</h1>;
}
