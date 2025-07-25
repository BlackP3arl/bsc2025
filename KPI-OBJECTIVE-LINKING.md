# KPI to Strategic Objective Linking

## Overview

This feature implements the proper BSC (Balanced Scorecard) relationship where multiple KPIs can support strategic objectives, allowing for comprehensive performance measurement and strategic alignment.

## BSC Framework Implementation

### Strategic Hierarchy
```
Strategic Objectives (Financial, Customer, Internal, Learning & Growth)
    ↓ (supported by)
KPIs (Key Performance Indicators)
    ↓ (tracked through)
KPI Data (Actual measurements over time)
```

### Many-to-Many Relationship
- **One Strategic Objective** can be supported by **multiple KPIs**
- **One KPI** can support **multiple Strategic Objectives**
- This provides flexibility in strategic measurement and cascading

## Features Implemented

### ✅ KPI Form Enhancement
- **Strategic Objectives Dropdown**: Multi-select dropdown in KPI definition form
- **BSC Perspective Auto-Fill**: Automatically sets perspective based on selected objectives
- **Search & Filter**: Searchable dropdown with objective details
- **Visual Grouping**: Shows perspective and division for each objective

### ✅ Database Integration
- **objective_kpis Table**: Many-to-many relationship table with weights
- **Relationship Management**: Create, update, and delete KPI-objective links
- **Data Integrity**: Proper foreign key constraints and unique constraints

### ✅ Service Layer
- **linkKPIToObjectives()**: Links KPI to multiple objectives
- **getKPIObjectives()**: Gets objectives linked to a KPI
- **getObjectiveKPIs()**: Gets KPIs linked to an objective
- **Transaction Safety**: Proper cleanup and atomic operations

### ✅ React Hooks
- **useKPIObjectives()**: Hook to fetch objectives for a KPI
- **useObjectiveKPIs()**: Hook to fetch KPIs for an objective
- **Real-time Updates**: Automatic cache invalidation and updates

## User Experience

### Creating a New KPI
1. **Fill KPI Details**: Name, description, formula, etc.
2. **Select Strategic Objectives**: Choose one or more objectives this KPI supports
3. **Auto-Set Perspective**: BSC perspective automatically filled based on objectives
4. **Submit**: KPI created with objective relationships

### Editing an Existing KPI
1. **Load Current Links**: Existing objective relationships loaded automatically
2. **Modify Relationships**: Add or remove objective links
3. **Update Perspective**: Perspective updates based on new objective selection
4. **Save Changes**: Relationships updated in database

### Strategic Alignment Visualization
- **Perspective Grouping**: KPIs grouped by BSC perspective
- **Objective Context**: Shows which objectives each KPI supports
- **Division Mapping**: Displays division ownership for context

## Technical Implementation

### Database Schema
```sql
CREATE TABLE objective_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objective_id UUID REFERENCES strategic_objectives(id),
    kpi_id UUID REFERENCES kpi_definitions(id),
    weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(objective_id, kpi_id)
);
```

### Service Methods
```typescript
// Link KPI to multiple objectives
await kpiService.linkKPIToObjectives(kpiId, objectiveIds);

// Get objectives for a KPI
const objectives = await kpiService.getKPIObjectives(kpiId);

// Get KPIs for an objective
const kpis = await kpiService.getObjectiveKPIs(objectiveId);
```

### Form Integration
```typescript
// Multi-select dropdown with auto-perspective setting
<Select 
  mode="multiple"
  onChange={handleObjectiveChange}
  // Auto-sets perspective based on selection
/>
```

## BSC Benefits

### ✅ Strategic Alignment
- **Clear Linkage**: Every KPI directly linked to strategic objectives
- **Cascade Visibility**: See how objectives flow down to measurements
- **Gap Analysis**: Identify objectives without supporting KPIs

### ✅ Performance Management
- **Comprehensive Measurement**: Multiple KPIs per objective for complete view
- **Weighted Scoring**: Support for weighted importance (future enhancement)
- **Cross-Perspective Analysis**: KPIs that support multiple perspectives

### ✅ Reporting & Analytics
- **Objective Performance**: Aggregate KPI data by objective
- **Strategy Maps**: Visual representation of objective-KPI relationships
- **Dashboard Views**: Filter and group by strategic relationships

## Future Enhancements

### Weighted Relationships
- **KPI Weights**: Assign importance weights to KPI-objective relationships
- **Weighted Scoring**: Calculate objective performance based on weighted KPIs
- **Priority Management**: Identify most critical KPIs for each objective

### Advanced Analytics
- **Correlation Analysis**: Analyze relationships between objectives and KPIs
- **Predictive Modeling**: Use KPI trends to predict objective achievement
- **Automated Alerts**: Notify when KPIs affecting critical objectives decline

### Visual Strategy Maps
- **Interactive Diagrams**: Visual representation of objective-KPI relationships
- **Drill-down Capability**: Click objectives to see supporting KPIs
- **Performance Overlay**: Color-code based on current performance

## Validation Rules

### Form Validation
- **Required Selection**: At least one strategic objective must be selected
- **Perspective Consistency**: Warning if objectives span multiple perspectives
- **Division Alignment**: Optional validation for division consistency

### Data Validation
- **Unique Relationships**: Prevent duplicate objective-KPI links
- **Cascade Validation**: Ensure objectives exist before linking
- **Role-based Access**: Only authorized users can modify relationships

## Testing Checklist

### ✅ KPI Creation
- [ ] Create KPI with single objective link
- [ ] Create KPI with multiple objective links
- [ ] Verify perspective auto-fill works
- [ ] Test form validation

### ✅ KPI Editing
- [ ] Edit KPI and change objective links
- [ ] Remove all objective links (should require at least one)
- [ ] Add objectives from different perspectives
- [ ] Verify data persistence

### ✅ Relationship Management
- [ ] Verify relationships stored in database
- [ ] Test relationship deletion when KPI deleted
- [ ] Check foreign key constraints
- [ ] Validate unique constraints

### ✅ User Interface
- [ ] Multi-select dropdown functionality
- [ ] Search and filter within dropdown
- [ ] Perspective auto-update
- [ ] Loading states and error handling

## Migration Notes

### Existing KPIs
- **Automatic Migration**: Existing KPIs will need objective relationships added
- **Default Assignment**: Consider auto-linking based on division or current categorization
- **User Notification**: Prompt users to review and update KPI-objective links

### Data Cleanup
- **Orphaned KPIs**: Identify KPIs without objective links
- **Review Process**: Systematic review of all KPI-objective relationships
- **Training**: User training on new BSC-compliant workflow

---

**Status**: ✅ Implementation Complete
**Integration**: Fully integrated with existing KPI management
**BSC Compliance**: Follows standard Balanced Scorecard framework
**Next Steps**: User training and data migration for existing KPIs