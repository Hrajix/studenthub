import { useState } from "react";
import { CheckCircle2, Circle, FileText, BookOpen, Sparkles, TrendingUp, TrendingDown, Target } from "lucide-react";

type Step = "select" | "generate" | "results";

interface Material {
  id: string;
  name: string;
  type: string;
  selected: boolean;
}

interface Question {
  id: string;
  type: "multiple-choice" | "open-ended";
  question: string;
  options?: string[];
  correctAnswer?: string;
  userAnswer?: string;
}

export default function Tests() {
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [isGenerating, setIsGenerating] = useState(false);

  const [materials, setMaterials] = useState<Material[]>([
    {
      id: "1",
      name: "Integrály - poznámky",
      type: "Matematika",
      selected: false,
    },
    {
      id: "2",
      name: "Zápisník: Derivace",
      type: "Matematika",
      selected: false,
    },
    {
      id: "3",
      name: "Kvadratické rovnice",
      type: "Matematika",
      selected: false,
    },
    {
      id: "4",
      name: "Newtonovy zákony",
      type: "Fyzika",
      selected: false,
    },
    {
      id: "5",
      name: "Chemické rovnice",
      type: "Chemie",
      selected: false,
    },
  ]);

  const [questions] = useState<Question[]>([
    {
      id: "1",
      type: "multiple-choice",
      question: "Jaký je výsledek integrálu ∫2x dx?",
      options: ["x²", "x² + C", "2x²", "2x² + C"],
      correctAnswer: "x² + C",
      userAnswer: "x² + C",
    },
    {
      id: "2",
      type: "multiple-choice",
      question: "Co je derivace funkce f(x) = x³?",
      options: ["3x²", "x²", "3x", "x³"],
      correctAnswer: "3x²",
      userAnswer: "3x²",
    },
    {
      id: "3",
      type: "open-ended",
      question: "Vysvětlete rozdíl mezi určitým a neurčitým integrálem.",
      userAnswer: "Neurčitý integrál je obecný vzorec, určitý integrál má konkrétní hodnotu v daném intervalu.",
    },
    {
      id: "4",
      type: "multiple-choice",
      question: "Jaká je diskriminant kvadratické rovnice x² + 5x + 6 = 0?",
      options: ["1", "5", "11", "25"],
      correctAnswer: "1",
      userAnswer: "1",
    },
  ]);

  const toggleMaterial = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m))
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep("results");
    }, 2000);
  };

  const selectedCount = materials.filter((m) => m.selected).length;
  const correctAnswers = questions.filter(
    (q) => q.type === "multiple-choice" && q.userAnswer === q.correctAnswer
  ).length;
  const totalQuestions = questions.filter((q) => q.type === "multiple-choice").length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Generátor testů
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vytvářejte personalizované testy z vašich studijních materiálů
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[
            { step: "select", label: "Výběr materiálů" },
            { step: "generate", label: "Generování" },
            { step: "results", label: "Výsledky" },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep === item.step
                      ? "bg-indigo-500 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30"
                      : currentStep === "results" || (currentStep === "generate" && item.step === "select")
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {currentStep === "results" || (currentStep === "generate" && item.step === "select") ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`w-20 h-1 rounded-full ${
                    currentStep === "results" || (currentStep === "generate" && index === 0)
                      ? "bg-green-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Material Selection */}
      {currentStep === "select" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Vyberte materiály a poznámky
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Zvolte materiály, ze kterých chcete vygenerovat test
            </p>
          </div>
          <div className="p-6 space-y-2">
            {materials.map((material) => (
              <div
                key={material.id}
                onClick={() => toggleMaterial(material.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  material.selected
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {material.selected ? (
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {material.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {material.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} {selectedCount === 1 ? "materiál vybrán" : "materiály vybrány"}
            </p>
            <button
              onClick={() => setCurrentStep("generate")}
              disabled={selectedCount === 0}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pokračovat
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generate Test */}
      {currentStep === "generate" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {isGenerating ? "Generuji test..." : "Připraveno k generování"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {isGenerating
                ? "AI analyzuje vaše materiály a vytváří personalizované otázky"
                : "Klikněte na tlačítko níže pro vytvoření testu pomocí AI"}
            </p>
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Vygenerovat test
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {currentStep === "results" && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Výsledky testu</h2>
                <p className="opacity-90">
                  Odpověděli jste správně na {correctAnswers} z {totalQuestions} otázek
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-1">{score}%</div>
                <p className="text-sm opacity-90">Úspěšnost</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Otázky a odpovědi
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-900 dark:text-white font-medium flex-1">
                      {question.question}
                    </p>
                  </div>
                  {question.type === "multiple-choice" ? (
                    <div className="ml-9 space-y-2">
                      {question.options?.map((option) => (
                        <div
                          key={option}
                          className={`p-3 rounded-lg border ${
                            option === question.correctAnswer
                              ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                              : option === question.userAnswer && option !== question.correctAnswer
                              ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                              : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-white">{option}</span>
                            {option === question.correctAnswer && (
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-9 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Vaše odpověď:</strong> {question.userAnswer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What to Improve */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Co zlepšit
                </h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <Target className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Procvičte aplikaci derivací v praktických úlohách</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <Target className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Opakujte rozdíl mezi určitým a neurčitým integrálem</span>
                </li>
              </ul>
            </div>

            {/* What You Know Well */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Co už umíte
                </h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Výborná znalost základních integračních vzorců</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Správné pochopení derivací polynomických funkcí</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setCurrentStep("select");
                setMaterials((prev) => prev.map((m) => ({ ...m, selected: false })));
              }}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
            >
              Nový test
            </button>
            <button className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Studovat doporučené materiály
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
