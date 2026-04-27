# ft_transcendence Evaluation Sheet

Source: https://www.42evalhub.com/common/fttranscendence

Captured: 2026-04-27

Subject cross-reference: `other/transcendance.md` is still the official source of truth. Use this file as a readable copy of the peer-evaluation checklist, then verify module definitions and project requirements against the subject.

## Evaluation Rules

- Only grade work in the evaluated Git repository.
- Verify each step carefully and test thoroughly.
- The project must reach at least 14 validated module points to pass.
- Check `README.md` for chosen modules and justifications.
- All team members must be present and participate.
- Confirm the repository belongs to the evaluated students and was cloned into an empty folder.
- Check that no malicious aliases or scripts are being used.
- Review any helper scripts before using them.
- If the evaluator has not completed the assignment, they should read the full subject first.
- Empty repository, non-functioning program, Norm error, cheating, and similar flags can end the evaluation with 0, or -42 for cheating.

## Preliminaries

### Team Presence

Verify that all team members, 4-5 people, are present for the evaluation.

Question: Are all team members present? If not all members are present, the review stops here.

### Individual Contributions

Ask each team member individually to explain:

- Their role in the project: PO, PM, Tech Lead, or Developer.
- Their specific contributions and what they worked on.
- At least one feature or module they personally implemented.

Question: Can each team member clearly explain their role and contributions?

### README Verification

Verify that `README.md` contains:

- Project name and description.
- Team members with assigned roles.
- Project management approach.
- Technologies used with justifications.
- Database schema.
- List of features and who implemented them.
- Chosen modules with justifications and point calculation.
- Individual contributions of each member.

Question: Is `README.md` complete with all required sections?

### Project Coherence

Ask at least two different team members to explain:

- The project concept and what it does.
- The main technologies used and why.
- How the team coordinated the work.

Question: Can different team members explain the project coherently?

### Git History

Verify team collaboration in Git:

- Repository shows commits from all team members.
- Commit messages are clear and meaningful.
- Work is distributed among team members.

Question: Does the Git history show proper team collaboration?

## General Requirements

### Architecture Components

The project must have:

- Frontend.
- Backend.
- Database.

Question: Are all three components present and functional?

### Deployment

The full application must deploy with a containerization solution, such as Docker or Podman, using a single command.

Question: Can a team member demonstrate deployment without manual intervention?

### Browser Compatibility

The application must run on the latest stable Google Chrome without visible console errors or warnings. Minor third-party warnings may be acceptable if explained.

Question: Does Chrome run cleanly during the demo?

### Privacy Policy and Terms of Service

Both pages must:

- Be easily accessible from the application.
- Contain relevant content for the project.
- Not be placeholder or empty pages.

Question: Are both Privacy Policy and Terms of Service pages accessible and relevant?

## Technical Requirements

### Frontend Responsiveness

Test at least desktop and mobile/tablet screen sizes. The interface must adapt and remain usable.

Question: Is the frontend clear, responsive, and accessible across devices?

### Styling Solution

The project must use a modern CSS framework or styling solution, such as Tailwind CSS, Bootstrap, Material UI, Styled Components, or equivalent. Plain CSS alone is not sufficient for this evaluation sheet.

Question: Can the team show examples of the styling solution in the code?

### Environment Variables

Verify:

- `.env` files are ignored by Git.
- `.env.example` files are provided.
- No sensitive credentials are committed.

Question: Are credentials properly secured?

### Database Design

The database must have a clear schema and well-defined relations.

Question: Can a team member show and explain the database schema?

### Authentication Security

The user management system must provide:

- Email/password signup and login.
- Properly hashed and salted passwords.

Question: Can the team explain the password hashing and salting implementation?

### Form Validation

All forms and user inputs must be validated in both frontend and backend. Test invalid inputs, wrong formats, injection attempts, and XSS attempts.

Question: Is validation present on both sides, especially server-side?

### Secure Connections

Backend communication must use HTTPS.

Question: Is all frontend/backend communication encrypted over HTTPS?

## Modules Verification

### Module Points

Review the `README.md` modules section:

- List all claimed modules.
- Major module = 2 points.
- Minor module = 1 point.
- Calculate the total.

Question: Does the project claim at least 14 module points?

### Major Modules

For each claimed major module:

- Ask the team to demonstrate it.
- Verify it is fully implemented and functional.
- Check it meets major module complexity requirements.
- Confirm it adds real value.
- Verify dependencies are met, for example gaming modules require a game.

Question: Are all claimed major modules properly implemented and functional?

### Minor Modules

For each claimed minor module:

- Ask the team to demonstrate it.
- Verify it is fully implemented and functional.
- Check it adds meaningful value.
- Verify dependencies are met.

Question: Are all claimed minor modules properly implemented and functional?

### Modules of Choice

If custom modules are claimed, verify `README.md` explains:

- Why the team chose the module.
- What technical challenges it addresses.
- How it adds value.
- Why it deserves major or minor status.

Also verify it is not a shortcut, is relevant to the project, and demonstrates technical skill.

Question: Are custom modules properly justified and implemented?

## Code Quality

### Code Structure

Review whether the code has:

- Clear file and folder structure.
- Understandable code.
- No major code quality issues.
- Consistent coding style.

Question: Is the code reasonably well organized and readable?

### Technical Decisions

Ask the team about:

- Why they chose their stack.
- How they structured the application.
- Challenges faced and solutions implemented.
- Trade-offs made during development.

Question: Can the team justify their technical decisions?

### Teamwork Evidence

Check:

- All members contributed.
- Team members can explain each other's work.
- Work appears coordinated and integrated.
- `README.md` shows clear work distribution.
- No single person did all the work.

Question: Does the project demonstrate effective team collaboration?

## Functionality

### Stability and Functionality

Test that:

- No critical bugs or crashes happen during the demo.
- Main features work as expected.
- Basic error handling is present.
- User experience is acceptable.
- Multiple users can use the app simultaneously.

Question: Is the application functional and reasonably stable?

### Overall Quality

Assess whether the project:

- Shows understanding of web development concepts.
- Goes beyond minimal requirements.
- Shows that the team learned new technologies or concepts.
- Shows creativity or interesting implementation.
- Has a well-executed concept.

Question: Does the project reflect genuine effort and learning?

## Final Verification

### Final Module Count

Count only modules that were successfully demonstrated and work properly:

- Major module = 2 points.
- Minor module = 1 point.
- Non-functional or incomplete module = 0 points.

Question: Does the total of validated modules reach at least 14 points?

### Project Success

Final assessment:

- Is the mandatory part complete and functional?
- Did all team members contribute meaningfully?
- Can the team explain their work and decisions?
- Does the project meet the subject requirements?
- Is `README.md` complete and accurate?

Question: Would the evaluator consider this a successful group project?

## Bonus

Bonus is evaluated only if the mandatory part is entirely and perfectly done and error management handles unexpected or bad usage. Bonus points are for validated modules beyond the required 14 points, with a maximum of 5 bonus points.

For each extra module:

- Verify it is fully functional.
- Confirm it meets the subject requirements.
- Check that it adds value.
- Ensure proper justification in `README.md`.

Bonus scoring:

- 0: no bonus modules.
- 1: one minor module or partial major.
- 2: one major module or two minor modules.
- 3: one major plus one minor, or three minor modules.
- 4: two major modules or equivalent.
- 5: excellent bonus modules.
