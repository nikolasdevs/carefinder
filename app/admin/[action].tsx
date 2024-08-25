// pages/admin/[action].js
import { useRouter } from "next/router";

export async function getStaticPaths() {
  return {
    paths: [
      { params: { action: "createAdmin" } },
      { params: { action: "adminLogin" } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  return { props: { action: params.action } };
}

export default function AdminPage({ action }: any) {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  return <div>Admin action: {action}</div>;
}
