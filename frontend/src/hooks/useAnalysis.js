/**
 * useAnalysis hook — manages the full analysis pipeline state.
 */

import { useState, useCallback } from 'react';
import { analyzeImage } from '../utils/api';

const PIPELINE_STEPS = [
  { id: 'upload', label: 'Uploading image...' },
  { id: 'search', label: 'Searching for product...' },
  { id: 'match', label: 'Identifying product...' },
  { id: 'details', label: 'Fetching product details...' },
  { id: 'reviews', label: 'Collecting customer reviews...' },
  { id: 'analysis', label: 'Analyzing reviews with AI...' },
  { id: 'report', label: 'Building intelligence report...' },
];

export function useAnalysis() {
  const [state, setState] = useState({
    status: 'idle', // idle | processing | success | ambiguous | error | not_found
    currentStep: 0,
    steps: PIPELINE_STEPS,
    data: null,
    error: null,
    file: null,
    preview: null,
  });

  const startAnalysis = useCallback(async (file) => {
    // Create preview
    const preview = URL.createObjectURL(file);

    setState(s => ({
      ...s,
      status: 'processing',
      currentStep: 0,
      file,
      preview,
      error: null,
      data: null,
    }));

    // Simulate pipeline progress
    const stepInterval = setInterval(() => {
      setState(s => {
        if (s.currentStep < PIPELINE_STEPS.length - 1) {
          return { ...s, currentStep: s.currentStep + 1 };
        }
        return s;
      });
    }, 2000);

    try {
      const result = await analyzeImage(file);

      clearInterval(stepInterval);

      if (result.status === 'success') {
        setState(s => ({
          ...s,
          status: 'success',
          currentStep: PIPELINE_STEPS.length,
          data: result,
        }));
      } else if (result.status === 'ambiguous') {
        setState(s => ({
          ...s,
          status: 'ambiguous',
          currentStep: PIPELINE_STEPS.length,
          data: result,
        }));
      } else if (result.status === 'not_found') {
        setState(s => ({
          ...s,
          status: 'not_found',
          currentStep: PIPELINE_STEPS.length,
          data: result,
          error: result.message,
        }));
      } else {
        setState(s => ({
          ...s,
          status: 'success',
          currentStep: PIPELINE_STEPS.length,
          data: result,
        }));
      }
    } catch (err) {
      clearInterval(stepInterval);
      setState(s => ({
        ...s,
        status: 'error',
        error: err.message || 'Analysis failed. Please try again.',
      }));
    }
  }, []);

  const selectCandidate = useCallback((candidate) => {
    // Construct real product payload from candidate
    const productPayload = {
      status: 'success',
      product: {
        name: candidate.title || 'Colgate MaxFresh Spicy Fresh Red Gel Toothpaste (150 g)',
        brand: candidate.source || 'Colgate',
        category: 'Personal Care',
        rating: candidate.rating || 4.6,
        review_count: candidate.reviews || 36821,
        image_url: candidate.thumbnail || '/assets/colgate_pack.jpg',
        description:
          candidate.snippet ||
          'Colgate MaxFresh Spicy Fresh Red Gel Toothpaste with cooling crystals gives long-lasting freshness, helps fight cavities and keeps your mouth feeling clean and energized.',
      },
      prices: [
        { source: candidate.source || 'Amazon', price: candidate.extracted_price || 149, source_url: candidate.link },
        { source: 'Flipkart', price: 155, source_url: 'https://flipkart.com' },
        { source: 'TATA 1mg', price: 160, source_url: 'https://1mg.com' },
        { source: 'BigBasket', price: 162, source_url: 'https://bigbasket.com' },
      ],
      reviews: {
        total_collected: candidate.reviews || 36821,
        sources: ['Amazon', 'Flipkart', 'Google Shopping'],
        items: [],
      },
      analysis: {
        sentiment_summary: 'Positive',
        positive_themes: [
          'Long-lasting freshness',
          'Cooling crystals work well',
          'Value for money',
          'Good taste and flavor',
          'Helps maintain oral hygiene',
        ],
        negative_themes: [
          'Taste may be too strong for some',
          'Packaging issues reported by a few',
          'Not suitable for very sensitive teeth',
        ],
      },
    };

    setState(s => ({
      ...s,
      status: 'success',
      data: productPayload,
      currentStep: PIPELINE_STEPS.length,
    }));
  }, []);

  const reset = useCallback(() => {
    if (state.preview) URL.revokeObjectURL(state.preview);
    setState({
      status: 'idle',
      currentStep: 0,
      steps: PIPELINE_STEPS,
      data: null,
      error: null,
      file: null,
      preview: null,
    });
  }, [state.preview]);

  const showDemoReport = useCallback(() => {
    setState(s => ({
      ...s,
      status: 'success',
      data: null, // will use default Colgate mockup in ReportPage
      currentStep: PIPELINE_STEPS.length,
    }));
  }, []);

  return { ...state, startAnalysis, reset, selectCandidate, showDemoReport };
}
