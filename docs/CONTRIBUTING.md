# Contributing to HarveLogix AI

Thank you for your interest in contributing to HarveLogix AI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

## Getting Started

### 1. Fork the Repository

```bash
git clone https://github.com/sivasubramanian86/harve-logix-ai.git
cd harve-logix-ai
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Set Up Development Environment

```bash
# Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

# Mobile App
cd mobile-app
npm install
```

### 4. Make Your Changes

Follow the coding standards and guidelines below.

### 5. Test Your Changes

```bash
# Backend tests
pytest backend/tests/ -v --cov=backend

# Mobile app tests
npm test

# Linting
npm run lint
```

### 6. Commit Your Changes

```bash
git add .
git commit -m "feat: Add your feature description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `refactor:` for code refactoring
- `style:` for code style changes
- `chore:` for maintenance tasks

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Create a Pull Request

Open a pull request on GitHub with a clear description of your changes.

## Coding Standards

### Python

- **Style Guide:** PEP 8
- **Type Hints:** Required for all functions
- **Docstrings:** Google-style docstrings for all modules, classes, and functions
- **Testing:** Minimum 87% code coverage
- **Linting:** Use `black`, `flake8`, `isort`, `mypy`

Example:
```python
def analyze_harvest_timing(crop_type: str, growth_stage: int) -> Dict[str, Any]:
    """
    Analyze and recommend optimal harvest timing.

    Args:
        crop_type: Type of crop (e.g., 'tomato', 'onion')
        growth_stage: Current growth stage (0-10 scale)

    Returns:
        Dictionary containing harvest recommendation with date, time, and income impact

    Raises:
        ValueError: If crop_type is not supported
        TypeError: If growth_stage is not an integer
    """
    pass
```

### JavaScript/TypeScript

- **Style Guide:** ESLint configuration
- **Type Checking:** TypeScript for all new code
- **Testing:** Minimum 87% code coverage
- **Formatting:** Prettier for code formatting

Example:
```typescript
interface HarvestRecommendation {
  harvestDate: string;
  harvestTime: string;
  expectedIncomeGain: number;
  confidenceScore: number;
}

async function analyzeHarvestTiming(
  cropType: string,
  growthStage: number
): Promise<HarvestRecommendation> {
  // Implementation
}
```

## Testing Guidelines

### Unit Tests

- Test individual functions and methods
- Use descriptive test names
- Test both success and failure cases
- Mock external dependencies

```python
def test_analyze_harvest_timing_success():
    """Test successful harvest timing analysis."""
    agent = HarvestReadyAgent()
    result = agent.analyze_harvest_timing({
        'crop_type': 'tomato',
        'current_growth_stage': 8
    })
    assert result['status'] == 'success'
    assert 'harvest_date' in result['output']
```

### Integration Tests

- Test interactions between components
- Use test fixtures for setup/teardown
- Test with real AWS services (or mocked)

```python
def test_harvest_ready_to_supply_match_flow():
    """Test orchestration flow from HarvestReady to SupplyMatch."""
    # Setup
    farmer_id = 'test-farmer-123'
    
    # Execute
    result = orchestrator.route_request(farmer_id, {
        'request_type': 'all',
        'crop_type': 'tomato'
    })
    
    # Assert
    assert 'harvest_ready' in result['agents_invoked']
    assert 'supply_match' in result['agents_invoked']
```

### Property-Based Tests

- Test properties that should hold for all inputs
- Use Hypothesis for Python, fast-check for JavaScript
- Focus on core logic

```python
from hypothesis import given, strategies as st

@given(st.integers(min_value=0, max_value=10))
def test_harvest_timing_growth_stage_valid(growth_stage):
    """Test that harvest timing works for all valid growth stages."""
    agent = HarvestReadyAgent()
    result = agent.analyze_harvest_timing({
        'crop_type': 'tomato',
        'current_growth_stage': growth_stage
    })
    assert result['status'] == 'success'
```

## Documentation

### Code Comments

- Write clear, concise comments
- Explain the "why", not the "what"
- Keep comments up-to-date with code changes

### Docstrings

- Write docstrings for all public functions, classes, and modules
- Include type information
- Include examples where helpful

### README Updates

- Update README.md if your changes affect user-facing functionality
- Include examples of new features
- Update the table of contents if needed

## Pull Request Process

1. **Ensure all tests pass:**
   ```bash
   pytest backend/tests/ -v --cov=backend
   npm test
   ```

2. **Run linting:**
   ```bash
   npm run lint
   black backend/
   mypy backend/
   ```

3. **Update documentation:**
   - Update README.md if needed
   - Update API.md if you change API endpoints
   - Update ARCHITECTURE.md if you change system design

4. **Create descriptive PR:**
   - Clear title and description
   - Link related issues
   - Include screenshots/videos if applicable
   - List breaking changes if any

5. **Address review comments:**
   - Respond to all feedback
   - Make requested changes
   - Re-request review after changes

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Python version, etc.)
- Error logs/stack traces

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Potential impact on existing features

## Development Workflow

### Local Development

```bash
# Start backend development server
cd backend
python -m uvicorn main:app --reload

# Start mobile app development server
cd mobile-app
npm start

# Run tests in watch mode
pytest backend/tests/ -v --watch
npm test --watch
```

### Database Setup

```bash
# Create local DynamoDB
docker run -d -p 8000:8000 amazon/dynamodb-local

# Create local PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```

### AWS Credentials

```bash
# Configure AWS credentials for local development
aws configure

# Or use environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=ap-south-1
```

## Performance Considerations

- Optimize database queries (use indexes, pagination)
- Cache frequently accessed data
- Use async/await for I/O operations
- Monitor Lambda cold start times
- Profile code for bottlenecks

## Security Considerations

- Never commit secrets or credentials
- Use AWS Secrets Manager for sensitive data
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest and in transit
- Follow principle of least privilege for IAM roles

## Release Process

1. Update version number in `package.json` and `setup.py`
2. Update CHANGELOG.md
3. Create a release branch: `git checkout -b release/v1.0.0`
4. Create a pull request for the release
5. After merge, create a GitHub release with release notes
6. Deploy to production

## Getting Help

- **Documentation:** [docs/](../docs/)
- **Issues:** [GitHub Issues](https://github.com/sivasubramanian86/harve-logix-ai/issues)
- **Discussions:** [GitHub Discussions](https://github.com/sivasubramanian86/harve-logix-ai/discussions)
- **Email:** support@harvelogix.ai

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub contributors page
- Release notes

Thank you for contributing to HarveLogix AI!

---

**Last Updated:** 2026-01-25  
**Version:** 1.0  
**Status:** Active
