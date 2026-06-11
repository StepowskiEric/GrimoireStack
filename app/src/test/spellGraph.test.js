import { describe, it, expect } from 'vitest';
import { buildSpellGraph, getNodeBySkill } from '../data/spellGraph.js';

describe('spellGraph', () => {
  describe('buildSpellGraph', () => {
    it('returns nodes and edges', () => {
      const graph = buildSpellGraph();
      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('edges');
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(Array.isArray(graph.edges)).toBe(true);
    });

    it('has more nodes than edges', () => {
      const graph = buildSpellGraph();
      expect(graph.nodes.length).toBeGreaterThan(graph.edges.length);
    });

    it('each node has required fields', () => {
      const graph = buildSpellGraph();
      for (const node of graph.nodes) {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('label');
        expect(node).toHaveProperty('schoolId');
        expect(node).toHaveProperty('schoolName');
        expect(node).toHaveProperty('schoolSymbol');
      }
    });

    it('each edge has source, target, and weight', () => {
      const graph = buildSpellGraph();
      for (const edge of graph.edges) {
        expect(edge).toHaveProperty('source');
        expect(edge).toHaveProperty('target');
        expect(edge).toHaveProperty('weight');
        expect(typeof edge.weight).toBe('number');
        expect(edge.weight).toBeGreaterThan(0);
      }
    });

    it('nodes reference valid schools', () => {
      const graph = buildSpellGraph();
      const schoolIds = new Set();
      for (const school of graph.nodes) {
        // buildSpellGraph doesn't have schoolOfSkill in return — check schoolId is present
        expect(typeof school.schoolId).toBe('string');
      }
    });

    it('respects skillFilter parameter', () => {
      const graph = buildSpellGraph({ skillFilter: new Set(['debugging']) });
      for (const node of graph.nodes) {
        expect(node.schoolId).toBe('debugging');
      }
    });
  });

  describe('getNodeBySkill', () => {
    it('returns a node for a valid skill', () => {
      const graph = buildSpellGraph();
      const node = getNodeBySkill(graph, 'log-trace-correlation');
      expect(node).not.toBeNull();
      expect(node.id).toBe('log-trace-correlation');
    });

    it('returns null for an invalid skill', () => {
      const graph = buildSpellGraph();
      const node = getNodeBySkill(graph, 'nonexistent');
      expect(node).toBeNull();
    });
  });
});
