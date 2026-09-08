import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";

export default function VoiceInput({ onResult, placeholder = "Fale para preencher automaticamente..." }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      setRecording(false);
      setProcessing(true);
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "voice.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const text = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      setTranscript(text);

      // Use AI to parse the spoken text into structured data
      const parsed = await base44.integrations.Core.InvokeLLM({
        prompt: `O usuário falou: "${text}"\n\nExtraia as informações de medição de obra desse texto e retorne JSON com os campos disponíveis: servico, quantidade_executada, unidade, valor_unitario, comentarios. Se não encontrar um campo, deixe null. Exemplo: "Concretagem concluída, 42 metros cúbicos executados" → { servico: "Concretagem", quantidade_executada: 42, unidade: "m³", valor_unitario: null, comentarios: null }`,
        response_json_schema: {
          type: "object",
          properties: {
            servico: { type: "string" },
            quantidade_executada: { type: "number" },
            unidade: { type: "string" },
            valor_unitario: { type: "number" },
            comentarios: { type: "string" }
          }
        }
      });

      if (onResult) onResult({ transcript: text, parsed });
      setProcessing(false);
    };
    mediaRef.current = mr;
    mr.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRef.current?.state === "recording") {
      mediaRef.current.stop();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-bold">Preenchimento por Voz</p>
          <p className="text-xs text-muted-foreground">Fale e a IA preenche automaticamente</p>
        </div>
      </div>

      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={processing}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm transition-all ${
          recording
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            : processing
            ? "bg-violet-100 text-violet-600"
            : "bg-violet-600 hover:bg-violet-700 text-white"
        }`}
      >
        {processing ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Processando com IA...</>
        ) : recording ? (
          <><MicOff className="h-4 w-4" />Parar Gravação</>
        ) : (
          <><Mic className="h-4 w-4" />Iniciar Gravação</>
        )}
      </button>

      {transcript && (
        <div className="mt-3 p-3 bg-muted rounded-xl">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Você disse:</p>
          <p className="text-sm text-foreground italic">"{transcript}"</p>
        </div>
      )}
    </div>
  );
}