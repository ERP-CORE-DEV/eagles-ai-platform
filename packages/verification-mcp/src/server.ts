import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VerificationStore } from "./store/VerificationStore.js";
import { CheckpointManager } from "./checkpoints/checkpoint-manager.js";
import { scoreAgent } from "./scoring/agent-scorer.js";
import { assessTruth } from "./scoring/truth-scorer.js";

const DEFAULT_DB_PATH = join(tmpdir(), "eagles-verification.sqlite");

const scoreObservationSchema = z.object({
  dimension: z.enum(["accuracy", "reliability", "consistency", "efficiency", "adaptability"]),
  value: z.number().min(0).max(1),
  timestamp: z.string(),
});

export function createVerificationServer(dbPath?: string): McpServer {
  const store = new VerificationStore(dbPath ?? DEFAULT_DB_PATH);
  const checkpointManager = new CheckpointManager(store);
  const server = new McpServer({ name: "verification-mcp", version: "0.1.0" });

  // -------------------------------------------------------------------------
  // verify_output
  // -------------------------------------------------------------------------
  server.tool(
    "verify_output",
    {
      output: z.string(),
      expectedFormat: z.string().optional(),
      sourceContext: z.string().optional(),
      sessionId: z.string(),
    },
    async (params) => {
      const assessment = assessTruth({
        output: params.output,
        expectedFormat: params.expectedFormat,
        sourceContext: params.sourceContext,
      });

      store.insertVerificationRecord(params.sessionId, assessment);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            sessionId: params.sessionId,
            confidence: assessment.confidence,
            flags: assessment.flags,
            suggestedAction: assessment.suggestedAction,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_score_agent
  // -------------------------------------------------------------------------
  server.tool(
    "verify_score_agent",
    {
      sessionId: z.string(),
      agentId: z.string(),
      observations: z.array(scoreObservationSchema),
      halfLifeHours: z.number().positive().optional(),
    },
    async (params) => {
      const agentScore = scoreAgent(params.observations, params.halfLifeHours ?? 24);

      store.insertAgentScore(params.sessionId, params.agentId, agentScore);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            sessionId: params.sessionId,
            agentId: params.agentId,
            accuracy: agentScore.accuracy,
            reliability: agentScore.reliability,
            consistency: agentScore.consistency,
            efficiency: agentScore.efficiency,
            adaptability: agentScore.adaptability,
            composite: agentScore.composite,
            riskLevel: agentScore.riskLevel,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_checkpoint_create
  // -------------------------------------------------------------------------
  server.tool(
    "verify_checkpoint_create",
    {
      sessionId: z.string(),
      name: z.string(),
      stateJson: z.string(),
      agentScore: z.number().min(0).max(1).optional(),
      waveNumber: z.number().int().optional(),
      buildStatus: z.string().optional(),
      testStatus: z.string().optional(),
      commitSha: z.string().optional(),
    },
    async (params) => {
      const checkpoint = checkpointManager.create({
        sessionId: params.sessionId,
        name: params.name,
        stateJson: params.stateJson,
        agentScore: params.agentScore,
        waveNumber: params.waveNumber,
        buildStatus: params.buildStatus,
        testStatus: params.testStatus,
        commitSha: params.commitSha,
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            checkpointId: checkpoint.checkpointId,
            sessionId: checkpoint.sessionId,
            name: checkpoint.name,
            agentScore: checkpoint.agentScore,
            verified: checkpoint.verified,
            waveNumber: checkpoint.waveNumber,
            buildStatus: checkpoint.buildStatus,
            testStatus: checkpoint.testStatus,
            commitSha: checkpoint.commitSha,
            createdAt: checkpoint.createdAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_checkpoint_list
  // -------------------------------------------------------------------------
  server.tool(
    "verify_checkpoint_list",
    {
      sessionId: z.string(),
    },
    async (params) => {
      const checkpoints = checkpointManager.listForSession(params.sessionId);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            sessionId: params.sessionId,
            checkpoints: checkpoints.map((cp) => ({
              checkpointId: cp.checkpointId,
              name: cp.name,
              agentScore: cp.agentScore,
              verified: cp.verified,
              createdAt: cp.createdAt,
            })),
            total: checkpoints.length,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_checkpoint_restore
  // -------------------------------------------------------------------------
  server.tool(
    "verify_checkpoint_restore",
    {
      checkpointId: z.string(),
    },
    async (params) => {
      const checkpoint = checkpointManager.restore(params.checkpointId);

      if (checkpoint === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: `Checkpoint not found: ${params.checkpointId}`,
            }),
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            checkpointId: checkpoint.checkpointId,
            sessionId: checkpoint.sessionId,
            name: checkpoint.name,
            stateJson: checkpoint.stateJson,
            agentScore: checkpoint.agentScore,
            verified: checkpoint.verified,
            createdAt: checkpoint.createdAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_rollback
  // -------------------------------------------------------------------------
  server.tool(
    "verify_rollback",
    {
      sessionId: z.string(),
    },
    async (params) => {
      const checkpoint = checkpointManager.getLastGood(params.sessionId);

      if (checkpoint === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: `No verified checkpoint found for session: ${params.sessionId}`,
            }),
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            checkpointId: checkpoint.checkpointId,
            sessionId: checkpoint.sessionId,
            name: checkpoint.name,
            stateJson: checkpoint.stateJson,
            agentScore: checkpoint.agentScore,
            verified: checkpoint.verified,
            createdAt: checkpoint.createdAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_pipeline_run
  // -------------------------------------------------------------------------
  server.tool(
    "verify_pipeline_run",
    {
      sessionId: z.string(),
      agentId: z.string(),
      output: z.string(),
      observations: z.array(scoreObservationSchema),
    },
    async (params) => {
      const assessment = assessTruth({ output: params.output });
      store.insertVerificationRecord(params.sessionId, assessment);

      const agentScore = scoreAgent(params.observations);
      store.insertAgentScore(params.sessionId, params.agentId, agentScore);

      let autoCheckpoint = null;
      if (assessment.suggestedAction === "accept" && agentScore.composite >= 0.7) {
        autoCheckpoint = checkpointManager.create({
          sessionId: params.sessionId,
          name: `auto-${new Date().toISOString()}`,
          stateJson: JSON.stringify({ output: params.output, agentId: params.agentId }),
          agentScore: agentScore.composite,
        });
        checkpointManager.verify(autoCheckpoint.checkpointId);
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            sessionId: params.sessionId,
            agentId: params.agentId,
            assessment: {
              confidence: assessment.confidence,
              flags: assessment.flags,
              suggestedAction: assessment.suggestedAction,
            },
            agentScore: {
              composite: agentScore.composite,
              riskLevel: agentScore.riskLevel,
            },
            autoCheckpointCreated: autoCheckpoint !== null,
            checkpointId: autoCheckpoint?.checkpointId ?? null,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_checkpoint_findings
  // -------------------------------------------------------------------------
  server.tool(
    "verify_checkpoint_findings",
    {
      action: z.enum(["add", "list", "resolve"]),
      checkpointId: z.string(),
      severity: z.enum(["P0", "P1", "P2", "P3"]).optional(),
      file: z.string().optional(),
      line: z.number().int().optional(),
      description: z.string().optional(),
      blocker: z.boolean().optional(),
      findingId: z.string().optional(),
      fixCommit: z.string().optional(),
    },
    async (params) => {
      if (params.action === "add") {
        if (!params.severity || !params.file || !params.description) {
          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({ error: "severity, file, and description are required for 'add'" }),
            }],
          };
        }
        const finding = checkpointManager.addFinding({
          checkpointId: params.checkpointId,
          severity: params.severity,
          file: params.file,
          line: params.line,
          description: params.description,
          blocker: params.blocker,
        });
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(finding),
          }],
        };
      }

      if (params.action === "resolve") {
        if (!params.findingId || !params.fixCommit) {
          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({ error: "findingId and fixCommit are required for 'resolve'" }),
            }],
          };
        }
        checkpointManager.resolveFinding(params.findingId, params.fixCommit);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ resolved: true, findingId: params.findingId, fixCommit: params.fixCommit }),
          }],
        };
      }

      // action === "list"
      const findings = checkpointManager.getFindings(params.checkpointId);
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            checkpointId: params.checkpointId,
            findings,
            total: findings.length,
            blockers: findings.filter((f) => f.blocker).length,
            unresolved: findings.filter((f) => !f.resolved).length,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_receipt_write
  // -------------------------------------------------------------------------
  server.tool(
    "verify_receipt_write",
    {
      sessionId: z.string(),
      agentName: z.string(),
      waveNumber: z.number().int(),
      output: z.string(),
      evidence: z.record(z.unknown()).optional(),
    },
    async (params) => {
      const receipt = checkpointManager.writeReceipt({
        sessionId: params.sessionId,
        agentName: params.agentName,
        waveNumber: params.waveNumber,
        output: params.output,
        evidence: params.evidence,
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(receipt),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_receipt_list
  // -------------------------------------------------------------------------
  server.tool(
    "verify_receipt_list",
    {
      sessionId: z.string(),
      waveNumber: z.number().int().optional(),
    },
    async (params) => {
      const receipts = checkpointManager.listReceipts(params.sessionId, params.waveNumber);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            sessionId: params.sessionId,
            waveNumber: params.waveNumber ?? null,
            receipts,
            total: receipts.length,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_receipt_chain
  // -------------------------------------------------------------------------
  server.tool(
    "verify_receipt_chain",
    {
      sessionId: z.string(),
      expectedAgents: z.array(z.string()),
      waveNumber: z.number().int(),
    },
    async (params) => {
      const result = checkpointManager.verifyReceiptChain(
        params.sessionId,
        params.expectedAgents,
        params.waveNumber,
      );

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            sessionId: params.sessionId,
            waveNumber: params.waveNumber,
            complete: result.complete,
            missing: result.missing,
            receipts: result.receipts,
            total: result.receipts.length,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // verify_history
  // -------------------------------------------------------------------------
  server.tool(
    "verify_history",
    {
      sessionId: z.string(),
    },
    async (params) => {
      const history = store.getVerificationHistory(params.sessionId);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            sessionId: params.sessionId,
            records: history.map((r) => ({
              id: r.id,
              confidence: r.confidence,
              suggestedAction: r.suggestedAction,
              flags: r.flags,
              verifiedAt: r.verifiedAt,
            })),
            total: history.length,
          }),
        }],
      };
    },
  );

  return server;
}
