import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/auth?next=/')
    }
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = await kv.list("resume:*", true) as KVItem[];
      const parsedResumes = resumes.map((resume) => {
        return JSON.parse(resume.value) as Resume;
      });
      setResumes(parsedResumes);
      setLoadingResumes(false);
    };

    loadResumes();
  }, [kv]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2 className="text-gray-500">
              No resumes found. Upload your first resume to get feedback!
            </h2>
          ) : (
            <h2>Review your submission and check AI-powered feedback.</h2>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col justify-center items-center">
            <img src="/images/resume-scan-2.gif" alt="Loading" className="w-[200px]" />
          </div>
        )}
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume: Resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload New Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
