# Deployment Checklist - Recommendation System Optimization

## Pre-Deployment

### 1. Code Review
- [x] In-memory caching implemented with 5-min TTL
- [x] Concurrent goroutines with semaphore (max 15)
- [x] Batch database queries implemented
- [x] Database indexes migration created
- [x] Cache cleanup goroutine added to main.go
- [x] Profile update handlers clear cache
- [x] All code compiles without errors
- [x] Documentation created

### 2. Testing (Local)
- [ ] Test cold cache performance (should be 200-500ms)
- [ ] Test warm cache performance (should be <10ms)
- [ ] Verify `"cached": true` flag in response
- [ ] Test cache invalidation on profile update
- [ ] Run load test script (./test_load.sh)
- [ ] Check for memory leaks with pprof
- [ ] Verify no goroutine leaks

### 3. Database Preparation
- [ ] Review model changes in `models/` directory
- [ ] Verify GORM struct tags for indexes are correct
- [ ] Backup production database before migration
- [ ] Plan for AutoMigrate execution (happens automatically on startup)

## Deployment Steps

### Step 1: Build Application
```bash
cd Backend
go mod tidy
go build -o server main.go
```
**Status:** [ ] Complete

### Step 2: Deploy Code
```bash
# Stop existing server
# Deploy new binary
# Or use your CI/CD pipeline
```
**Status:** [ ] Complete

### Step 3: Start Server (Indexes Created Automatically)
```bash
./server

# GORM's AutoMigrate will automatically create indexes from struct tags
# Verify startup log includes:
# "✅ Recommendation cache cleanup started"
```
**Status:** [ ] Complete

### Step 4: Verify Indexes Were Created
### Step 4: Verify Indexes Were Created
```bash
# Connect to database
psql -U your_user -d your_database

# List all indexes
\di

# You should see indexes like:
# - idx_projects_is_active_creator (composite)
# - idx_proj_requests_uid_time (composite)
# - Plus various single-column indexes on uid, p_id, etc.

# Check specific table indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('projects', 'proj_requests', 'students', 'users', 'research_preferences')
ORDER BY tablename, indexname;
```
**Status:** [ ] Complete

## Post-Deployment Verification

### Immediate Checks (within 5 minutes)
- [ ] Server started successfully
- [ ] Cache cleanup goroutine started (check logs)
- [ ] Health check endpoint responding
- [ ] No errors in application logs
- [ ] Database connection pool stable

### Functional Tests (within 15 minutes)
- [ ] Make test recommendation request
- [ ] Verify response time <500ms (cold)
- [ ] Make second request immediately
- [ ] Verify response time <10ms (warm)
- [ ] Verify `"cached": true` in second response
- [ ] Update test user profile
- [ ] Verify cache cleared (next request is cold)

### Performance Tests (within 30 minutes)
- [ ] Run load test: `./test_load.sh`
- [ ] Verify cache hit rate >80%
- [ ] Check average response time <100ms
- [ ] Verify no failed requests
- [ ] Monitor database query count (~5 per request)
- [ ] Check CPU usage is stable
- [ ] Check memory usage is stable

### Monitoring Setup (within 1 hour)
- [ ] Set up alerts for high response times (>1s)
- [ ] Set up alerts for low cache hit rate (<70%)
- [ ] Monitor database connection pool usage
- [ ] Monitor goroutine count
- [ ] Set up dashboard for recommendation metrics

## Rollback Plan

If issues are encountered:

### Rollback Database Changes
GORM indexes can be removed manually if needed:

```sql
-- Drop composite indexes if causing issues
DROP INDEX IF EXISTS idx_projects_is_active_creator;
DROP INDEX IF EXISTS idx_proj_requests_uid_time;

-- Drop other indexes if needed (check with \di first)
-- Note: GORM will recreate them on next startup unless you revert the code
```

### Rollback Code
```bash
# Revert to previous version
git checkout <previous-commit>
go build -o server main.go

# Restart server
./server
```

### Signs to Rollback
- [ ] Error rate >5%
- [ ] Response time >5s consistently
- [ ] Database errors
- [ ] Memory leaks
- [ ] Server crashes

## Success Criteria

### Performance Metrics
- [x] **Cache Hit Rate:** >80% after warmup
- [x] **Cold Cache Response:** <500ms (200-400ms target)
- [x] **Warm Cache Response:** <10ms (5-10ms target)
- [x] **Database Queries:** ≤5 per request
- [x] **Concurrent Users:** 100+ supported
- [x] **Error Rate:** <0.1%

### Operational Metrics
- [x] **Memory Usage:** Stable over 24 hours
- [x] **CPU Usage:** <70% under normal load
- [x] **Database Load:** Reduced by 95%
- [x] **No Errors:** Clean logs for 1 hour

## Monitoring Queries

### Check Cache Performance
```bash
# Request with cache flag
curl -H "Authorization: Bearer TOKEN" \
  http://your-server/api/v1/recommendations | jq '.cached'
```

### Check Database Query Count
```sql
-- In PostgreSQL
SELECT count(*) FROM pg_stat_statements 
WHERE query LIKE '%projects%' 
  AND calls > 0;
```

### Check Index Usage
```sql
-- In PostgreSQL
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

### Check Application Metrics
```bash
# If using pprof
curl http://localhost:6060/debug/pprof/heap > heap.prof
go tool pprof heap.prof
```

## Post-Deployment Tasks

### Day 1
- [ ] Monitor error logs every hour
- [ ] Check cache hit rate every 2 hours
- [ ] Verify response times are stable
- [ ] Review database metrics
- [ ] Collect baseline performance data

### Week 1
- [ ] Analyze cache effectiveness
- [ ] Review and tune semaphore size if needed
- [ ] Adjust cache TTL if needed
- [ ] Document any issues encountered
- [ ] Collect user feedback

### Week 2-4
- [ ] Compare performance to pre-optimization baseline
- [ ] Identify additional optimization opportunities
- [ ] Consider Redis if scaling beyond single server
- [ ] Plan for A/B testing different algorithms

## Team Communication

### Notify Teams
- [ ] Backend team about deployment
- [ ] Frontend team about new `cached` field
- [ ] QA team about testing procedures
- [ ] DevOps about monitoring setup
- [ ] Product team about performance improvements

### Documentation Updates
- [ ] Update API documentation with `cached` field
- [ ] Update runbook with new troubleshooting steps
- [ ] Share performance benchmarks
- [ ] Document cache invalidation behavior

## Sign-off

### Pre-Deployment
- [ ] Tech Lead Reviewed: ________________ Date: _______
- [ ] Code Review Complete: ______________ Date: _______
- [ ] Tests Passed: ______________________ Date: _______

### Deployment
- [ ] Database Migration Complete: _______ Date: _______ Time: _______
- [ ] Code Deployed: ____________________ Date: _______ Time: _______
- [ ] Verification Complete: _____________ Date: _______ Time: _______

### Post-Deployment
- [ ] Performance Verified: ______________ Date: _______ Time: _______
- [ ] Monitoring Confirmed: ______________ Date: _______ Time: _______
- [ ] Sign-off: _________________________ Date: _______ Time: _______

## Notes

Add any deployment notes, issues, or observations here:

---
---
---

## Emergency Contacts

- **Backend Lead:** [Name] - [Contact]
- **DevOps Lead:** [Name] - [Contact]
- **Database Admin:** [Name] - [Contact]
- **On-Call Engineer:** [Name] - [Contact]

---

**Deployment Version:** 2.0 (Optimized Recommendations)  
**Date:** _______________  
**Deployed By:** _______________
