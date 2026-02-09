-- AI Workflows Feature
-- Tables: workflows, workflow_executions, workflow_node_executions

-- Workflow definitions (saved workflow graphs)
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workflows_status_check" CHECK ("status" IN ('draft', 'published'))
);

CREATE INDEX "workflows_user_id_idx" ON "workflows"("user_id");
CREATE INDEX "workflows_user_id_updated_at_idx" ON "workflows"("user_id", "updated_at" DESC);
CREATE INDEX "workflows_is_template_idx" ON "workflows"("is_template") WHERE "is_template" = true;

ALTER TABLE "workflows" ADD CONSTRAINT "workflows_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Workflow executions (each run of a workflow)
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "workflow_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "input" JSONB,
    "output" JSONB,
    "total_tokens" INTEGER DEFAULT 0,
    "total_cost" DOUBLE PRECISION DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workflow_executions_status_check" CHECK ("status" IN ('running', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX "workflow_executions_user_id_idx" ON "workflow_executions"("user_id");
CREATE INDEX "workflow_executions_workflow_id_idx" ON "workflow_executions"("workflow_id");
CREATE INDEX "workflow_executions_user_id_started_at_idx" ON "workflow_executions"("user_id", "started_at" DESC);

ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_fkey"
    FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Per-node execution results
CREATE TABLE "workflow_node_executions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "execution_id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "node_label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" JSONB,
    "output" JSONB,
    "tokens_used" INTEGER DEFAULT 0,
    "cost" DOUBLE PRECISION DEFAULT 0,
    "latency_ms" INTEGER DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "workflow_node_executions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workflow_node_executions_status_check" CHECK ("status" IN ('pending', 'running', 'completed', 'failed', 'skipped'))
);

CREATE INDEX "wne_execution_id_idx" ON "workflow_node_executions"("execution_id");
CREATE INDEX "wne_execution_id_node_id_idx" ON "workflow_node_executions"("execution_id", "node_id");

ALTER TABLE "workflow_node_executions" ADD CONSTRAINT "wne_execution_id_fkey"
    FOREIGN KEY ("execution_id") REFERENCES "workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row Level Security
ALTER TABLE "workflows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow_node_executions" ENABLE ROW LEVEL SECURITY;

-- Users can only access their own workflows
CREATE POLICY "workflows_user_policy" ON "workflows"
    FOR ALL USING ("user_id" = auth.uid()::text);

-- Users can only access their own executions
CREATE POLICY "workflow_executions_user_policy" ON "workflow_executions"
    FOR ALL USING ("user_id" = auth.uid()::text);

-- Users can access node executions via their workflow executions
CREATE POLICY "wne_user_policy" ON "workflow_node_executions"
    FOR ALL USING (
        "execution_id" IN (
            SELECT "id" FROM "workflow_executions" WHERE "user_id" = auth.uid()::text
        )
    );

-- Template workflows are readable by all authenticated users
CREATE POLICY "workflows_template_read_policy" ON "workflows"
    FOR SELECT USING ("is_template" = true);
