import React from 'react';

interface ApiCodeBlockProps {
  requestMethod: string;
  requestPath: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseStatus: number;
  responseBody: unknown;
}

const CodeViewer: React.FC<{ code: string }> = ({ code }) => (
  <pre className="font-mono text-xs md:text-sm p-4 overflow-x-auto text-zinc-300">
    <code>{code}</code>
  </pre>
);

export const ApiCodeBlock: React.FC<ApiCodeBlockProps> = ({
  requestMethod,
  requestPath,
  requestHeaders,
  requestBody,
  responseStatus,
  responseBody,
}) => {
  const reqStr = [
    `${requestMethod} ${requestPath} HTTP/1.1`,
    ...(requestHeaders ? Object.entries(requestHeaders).map(([k, v]) => `${k}: ${v}`) : []),
    ...(requestBody ? ['', JSON.stringify(requestBody, null, 2)] : []),
  ].join('\n');

  const resStr = [
    `HTTP/1.1 ${responseStatus} ${responseStatus === 200 ? 'OK' : responseStatus === 202 ? 'Accepted' : 'Error'}`,
    'Content-Type: application/json',
    '',
    JSON.stringify(responseBody, null, 2),
  ].join('\n');

  return (
    <div className="flex flex-col lg:flex-row border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50 shadow-2xl">
      <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-zinc-800 min-w-0">
        <div className="bg-zinc-800/50 px-4 py-2 border-b border-zinc-800 flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs font-semibold text-zinc-400 tracking-wider">REQUEST</span>
        </div>
        <CodeViewer code={reqStr} />
      </div>
      <div className="w-full lg:w-1/2 min-w-0">
        <div className="bg-zinc-800/50 px-4 py-2 border-b border-zinc-800 flex items-center">
          <span className="text-xs font-semibold text-zinc-400 tracking-wider">RESPONSE</span>
        </div>
        <CodeViewer code={resStr} />
      </div>
    </div>
  );
};
