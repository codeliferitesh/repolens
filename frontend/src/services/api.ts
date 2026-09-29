import type { RepoAnalysisResponse, AssistantAnswer, SampleRepo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function analyzeRepository(url: string): Promise<RepoAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to analyze repository.';
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      errorDetail = `${response.statusText} (${response.status})`;
    }
    throw new ApiError(errorDetail, response.status);
  }

  return response.json();
}

export async function askRepoLens(url: string, question: string): Promise<AssistantAnswer> {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, question }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to answer repository query.';
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      errorDetail = `${response.statusText} (${response.status})`;
    }
    throw new ApiError(errorDetail, response.status);
  }

  return response.json();
}

export async function fetchSampleRepositories(): Promise<SampleRepo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/samples`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Could not fetch samples from backend, using fallbacks', e);
  }

  return [
    {
      name: 'react',
      owner: 'facebook',
      url: 'https://github.com/facebook/react',
      category: 'Frontend Framework',
      description: 'The library for web and native user interfaces.',
    },
    {
      name: 'fastapi',
      owner: 'fastapi',
      url: 'https://github.com/fastapi/fastapi',
      category: 'Backend / Python',
      description: 'High performance, easy to learn, fast to code, ready for production.',
    },
    {
      name: 'flask',
      owner: 'pallets',
      url: 'https://github.com/pallets/flask',
      category: 'Python Microframework',
      description: 'The Python micro framework for building web applications.',
    },
    {
      name: 'vue',
      owner: 'vuejs',
      url: 'https://github.com/vuejs/core',
      category: 'Frontend Framework',
      description: 'Progressive JavaScript framework for building user interfaces.',
    },
    {
      name: 'tailwindcss',
      owner: 'tailwindlabs',
      url: 'https://github.com/tailwindlabs/tailwindcss',
      category: 'CSS Framework',
      description: 'A utility-first CSS framework for rapid UI development.',
    },
  ];
}

export async function fetchRateLimit(): Promise<{ remaining: number; limit: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/rate-limit`);
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // ignore
  }
  return { remaining: 60, limit: 60 };
}
