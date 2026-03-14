'use client';

import mermaid from 'mermaid';
import { useEffect, useId, useState } from 'react';

let mermaidInitialized = false;

function ensureMermaidInitialized() {
    if (mermaidInitialized) {
        return;
    }

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'dark',
    });
    mermaidInitialized = true;
}

export default function MermaidDiagram({ chart }: { chart: string }) {
    const diagramId = useId().replace(/:/g, '');
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function renderDiagram() {
            try {
                ensureMermaidInitialized();
                const { svg: renderedSvg } = await mermaid.render(`mermaid-${diagramId}`, chart);

                if (!isCancelled) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (renderError) {
                if (!isCancelled) {
                    setError(renderError instanceof Error ? renderError.message : 'Failed to render Mermaid diagram.');
                }
            }
        }

        renderDiagram();

        return () => {
            isCancelled = true;
        };
    }, [chart, diagramId]);

    if (error) {
        return (
            <div className="my-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                <p className="mb-3 text-sm font-medium text-red-200">Mermaid render failed</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-zinc-200">{chart}</pre>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="my-8 rounded-2xl border border-zinc-800/80 bg-[#09090b] p-5 shadow-2xl">
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-zinc-400">{chart}</pre>
            </div>
        );
    }

    return (
        <div
            className="my-8 overflow-x-auto rounded-2xl border border-zinc-800/80 bg-[#09090b] p-5 shadow-2xl"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
