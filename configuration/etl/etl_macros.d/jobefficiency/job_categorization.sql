-- ----------------------------------------------------------------------------
-- Classify a job based on the performance statistics
-- ----------------------------------------------------------------------------
CASE 
    WHEN cpu_user IS NULL THEN
        -1
    WHEN cpu_user < 0.1 AND COALESCE(max_memory, 1.0) < 0.5 THEN
        2
    ELSE
        1
END
