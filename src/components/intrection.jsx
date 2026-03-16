// ================= PROJECT SHOWCASE GALLERY – MODERN UI =================

import { useState } from "react";
import { Heart, MessageCircle, Github, Upload } from "lucide-react";
import "./ProjectGallery.css";

const initialProjects = [
  {
    id: 1,
    title: "AI Eye Disease Detector",
    description:
      "Deep learning model to detect eye diseases from fundus images.",
    github: "https://github.com/",
    image: "https://picsum.photos/400/200?1",
    likes: 5,
    comments: ["Amazing project!", "Very useful 🔥"],
  },
];

export default function ProjectGallery() {
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState({
    title: "",
    description: "",
    github: "",
    image: "",
  });
  const [commentText, setCommentText] = useState("");
  const [activeId, setActiveId] = useState(null);

  const addProject = (e) => {
    e.preventDefault();

    const newProject = {
      id: Date.now(),
      ...form,
      likes: 0,
      comments: [],
    };

    setProjects([newProject, ...projects]);
    setForm({ title: "", description: "", github: "", image: "" });
  };

  const likeProject = (id) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
    );
  };

  const addComment = (id) => {
    if (!commentText) return;

    setProjects(
      projects.map((p) =>
        p.id === id ? { ...p, comments: [...p.comments, commentText] } : p,
      ),
    );

    setCommentText("");
    setActiveId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-slate-800 tracking-tight">
        🚀 Project Showcase
      </h1>

      {/* Upload Form */}
      <form
        onSubmit={addProject}
        className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-xl mb-10 space-y-4"
      >
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-700">
          <Upload size={20} /> Upload New Project
        </div>

        <input
          className="border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition p-3 w-full rounded-xl outline-none"
          placeholder="Project Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition p-3 w-full rounded-xl outline-none"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className="border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition p-3 w-full rounded-xl outline-none"
          placeholder="GitHub Link"
          value={form.github}
          onChange={(e) => setForm({ ...form, github: e.target.value })}
        />

        <input
          className="border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition p-3 w-full rounded-xl outline-none"
          placeholder="Screenshot Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <button className="bg-gradient-to-r from-indigo-500 to-emerald-500 hover:scale-[1.02] active:scale-95 transition text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
          Publish Project
        </button>
      </form>

      {/* Project Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((p) => (
          <div
            key={p.id}
            className="group bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="overflow-hidden">
              <img
                src={p.image}
                alt="project"
                className="h-48 w-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            <div className="p-5 space-y-3">
              <h2 className="text-xl font-bold text-slate-800">{p.title}</h2>
              <p className="text-sm text-slate-600 line-clamp-3">
                {p.description}
              </p>

              <a
                href={p.github}
                target="_blank"
                className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium hover:underline"
              >
                <Github size={16} /> View Code
              </a>

              {/* Like + Comment */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => likeProject(p.id)}
                  className="flex items-center gap-1 text-rose-500 font-semibold hover:scale-110 transition"
                >
                  <Heart size={18} /> {p.likes}
                </button>

                <button
                  onClick={() => setActiveId(activeId === p.id ? null : p.id)}
                  className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition"
                >
                  <MessageCircle size={18} /> {p.comments.length}
                </button>
              </div>

              {/* Comment Section */}
              {activeId === p.id && (
                <div className="pt-3 space-y-2">
                  <input
                    className="border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition p-2 w-full rounded-lg outline-none"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />

                  <button
                    onClick={() => addComment(p.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                  >
                    Post Comment
                  </button>

                  <div className="text-sm text-slate-600 space-y-1 max-h-24 overflow-y-auto">
                    {p.comments.map((c, i) => (
                      <p key={i}>• {c}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
