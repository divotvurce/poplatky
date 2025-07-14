import React from "react";
import { useParams, Link } from "react-router-dom";
import stories from "../data/storiesData";

export default function StoryDetail() {
  const { id } = useParams();
  const story = stories.find((s) => s.id.toString() === id);

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Příběh nebyl nalezen</h1>
        <Link to="/pribehy" className="text-indigo-600 underline">
          Zpět na přehled
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold text-indigo-900 mb-4">{story.title}</h1>
      <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">{story.content}</p>
      <Link to="/pribehy" className="text-indigo-600 underline">
        ← Zpět na všechny příběhy
      </Link>
    </div>
  );
}