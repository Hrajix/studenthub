import { useState } from "react";
import { Search, Upload, FileText, Image as ImageIcon, Presentation, Folder, Grid3x3, List, MoreVertical } from "lucide-react";

interface Material {
  id: string;
  name: string;
  type: "pdf" | "image" | "presentation" | "folder";
  size: string;
  category: string;
  uploadedAt: string;
  thumbnail?: string;
}

export default function Materials() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("Vše");

  const categories = [
    "Vše",
    "Matematika",
    "Čeština",
    "Angličtina",
    "Fyzika",
    "Chemie",
    "Ostatní",
  ];

  const materials: Material[] = [
    {
      id: "1",
      name: "Integrály - poznámky",
      type: "pdf",
      size: "2.4 MB",
      category: "Matematika",
      uploadedAt: "před 2 dny",
    },
    {
      id: "2",
      name: "Newtonovy zákony",
      type: "presentation",
      size: "5.1 MB",
      category: "Fyzika",
      uploadedAt: "před týdnem",
    },
    {
      id: "3",
      name: "Diagram chemické reakce",
      type: "image",
      size: "1.2 MB",
      category: "Chemie",
      uploadedAt: "před 3 dny",
    },
    {
      id: "4",
      name: "Anglická gramatika",
      type: "pdf",
      size: "3.7 MB",
      category: "Angličtina",
      uploadedAt: "včera",
    },
    {
      id: "5",
      name: "Literatura 19. století",
      type: "folder",
      size: "12 souborů",
      category: "Čeština",
      uploadedAt: "před 5 dny",
    },
    {
      id: "6",
      name: "Kvadratické rovnice",
      type: "pdf",
      size: "1.8 MB",
      category: "Matematika",
      uploadedAt: "před 4 dny",
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "image":
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case "presentation":
        return <Presentation className="w-8 h-8 text-orange-500" />;
      case "folder":
        return <Folder className="w-8 h-8 text-yellow-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const filteredMaterials =
    selectedCategory === "Vše"
      ? materials
      : materials.filter((m) => m.category === selectedCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Studijní materiály
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Spravujte a organizujte své studijní materiály
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat materiály..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
              <Upload className="w-5 h-5" />
              Nahrát
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === category
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Materials Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {getFileIcon(material.type)}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {material.name}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{material.size}</span>
                <span>{material.uploadedAt}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Název
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Kategorie
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Velikost
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Nahráno
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMaterials.map((material) => (
                <tr
                  key={material.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.type)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {material.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {material.category}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {material.size}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {material.uploadedAt}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Žádné materiály
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            V této kategorii nejsou žádné materiály
          </p>
        </div>
      )}
    </div>
  );
}
