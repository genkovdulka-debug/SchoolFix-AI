package main

import (
    "encoding/json"
    "fmt"
    "log"
    "math/rand"
    "net/http"
    "os"
    "path/filepath"
    "sort"
    "strconv"
    "strings"
    "sync"
    "time"
)

const (
    apiVersion = "/api"
    defaultPort = "8080"
    defaultPassword = "demo1234"
)

type User struct {
    ID         string `json:"id"`
    Name       string `json:"name"`
    Email      string `json:"email"`
    Role       string `json:"role"`
    Active     bool   `json:"active"`
    Phone      string `json:"phone,omitempty"`
    Department string `json:"department,omitempty"`
}

type Note struct {
    ID     string `json:"id"`
    Author string `json:"author"`
    Text   string `json:"text"`
    Date   string `json:"date"`
}

type TimelineEntry struct {
    ID     string `json:"id"`
    Status string `json:"status"`
    Author string `json:"author"`
    Date   string `json:"date"`
    Text   string `json:"text"`
}

type Issue struct {
    ID             string          `json:"id"`
    Title          string          `json:"title"`
    Description    string          `json:"description"`
    Category       string          `json:"category"`
    Building       string          `json:"building"`
    Room           string          `json:"room"`
    Status         string          `json:"status"`
    Priority       string          `json:"priority"`
    ReportedByID   string          `json:"reportedById"`
    ReportedByName string          `json:"reportedByName"`
    CreatedAt      string          `json:"createdAt"`
    UpdatedAt      string          `json:"updatedAt"`
    AssignedTeam   string          `json:"assignedTeam"`
    AssignedToID   string          `json:"assignedToId"`
    AssignedToName string          `json:"assignedToName"`
    Resolution     string          `json:"resolution"`
    ImageName      string          `json:"imageName,omitempty"`
    Notes          []Note          `json:"notes"`
    Timeline       []TimelineEntry `json:"timeline"`
}

type Category struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    DefaultTeam string `json:"defaultTeam"`
    Description string `json:"description"`
}

type Team struct {
    ID      string `json:"id"`
    Name    string `json:"name"`
    LeadID  string `json:"leadId"`
    Members int    `json:"members"`
    Handles string `json:"handles"`
}

type Notification struct {
    ID        string   `json:"id"`
    Title     string   `json:"title"`
    Message   string   `json:"message"`
    CreatedAt string   `json:"createdAt"`
    Read      bool     `json:"read"`
    Roles     []string `json:"roles"`
    IssueID   string   `json:"issueId"`
    HiddenFor []string `json:"hiddenFor,omitempty"`
}

type Settings struct {
    OverdueDays          int  `json:"overdueDays"`
    NotifyOnAssignment   bool `json:"notifyOnAssignment"`
    NotifyOnStatusChange bool `json:"notifyOnStatusChange"`
}

type Store struct {
    Issues        []Issue        `json:"issues"`
    Categories    []Category     `json:"categories"`
    Teams         []Team         `json:"teams"`
    Users         []User         `json:"users"`
    Notifications []Notification `json:"notifications"`
    Settings      Settings       `json:"settings"`
}

type LoginPayload struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type AccountPayload struct {
    Name       string `json:"name"`
    Email      string `json:"email"`
    Password   string `json:"password"`
    Phone      string `json:"phone,omitempty"`
    Department string `json:"department,omitempty"`
    Role       string `json:"role"`
}

type CreateIssuePayload struct {
    Title       string `json:"title"`
    Description string `json:"description"`
    Category    string `json:"category"`
    Building    string `json:"building"`
    Room        string `json:"room"`
    ImageName   string `json:"imageName,omitempty"`
    User        User   `json:"user"`
}

type IssueUpdatePayload struct {
    Status string `json:"status,omitempty"`
    Team   string `json:"team,omitempty"`
    Note   string `json:"note,omitempty"`
}

type appStore struct {
    mu    sync.RWMutex
    store Store
    file  string
}

func newDefaultStore() Store {
    return Store{
        Issues: []Issue{
            {ID: "SF-1001", Title: "Broken classroom chair", Description: "The back support of a chair in Room 204 has snapped and the chair is unsafe to sit on.", Category: "Furniture", Building: "Building A", Room: "204", Status: "Assigned", Priority: "Low", ReportedByID: "u1", ReportedByName: "Maria Santos", CreatedAt: "2026-10-26T08:30:00.000Z", UpdatedAt: "2026-10-26T10:30:00.000Z", AssignedTeam: "Maintenance", AssignedToID: "u4", AssignedToName: "Joel Ramos", Notes: []Note{}, Timeline: []TimelineEntry{{ID: "SF-1001-t0", Status: "Submitted", Author: "Maria Santos", Date: "2026-10-26T08:30:00.000Z", Text: "Report submitted"}, {ID: "SF-1001-t1", Status: "Assigned", Author: "Elena Garcia", Date: "2026-10-26T10:30:00.000Z", Text: "Assigned to Maintenance"}}},
            {ID: "SF-1002", Title: "Computer will not start", Description: "Computer station 14 shows a black screen and does not respond when the power button is pressed.", Category: "Computers & Devices", Building: "Computer Lab", Room: "301", Status: "In Progress", Priority: "High", ReportedByID: "u2", ReportedByName: "Daniel Reyes", CreatedAt: "2026-10-24T07:45:00.000Z", UpdatedAt: "2026-10-24T09:45:00.000Z", AssignedTeam: "IT Support", AssignedToID: "u3", AssignedToName: "Alex Cruz", Notes: []Note{{ID: "n-1", Author: "Alex Cruz", Text: "Checked the power cable and outlet. Testing the power supply next.", Date: "2026-10-24T10:15:00.000Z"}}, Timeline: []TimelineEntry{{ID: "SF-1002-t0", Status: "Submitted", Author: "Daniel Reyes", Date: "2026-10-24T07:45:00.000Z", Text: "Report submitted"}, {ID: "SF-1002-t1", Status: "Assigned", Author: "Elena Garcia", Date: "2026-10-24T08:45:00.000Z", Text: "Assigned to IT Support"}, {ID: "SF-1002-t2", Status: "In Progress", Author: "Alex Cruz", Date: "2026-10-24T09:45:00.000Z", Text: "Status changed to In Progress"}}},
            {ID: "SF-1003", Title: "Projector not displaying", Description: "The ceiling projector turns on but shows \"No Signal\" even with the HDMI cable connected.", Category: "Projectors & AV", Building: "Building B", Room: "112", Status: "Submitted", Priority: "Medium", ReportedByID: "u2", ReportedByName: "Daniel Reyes", CreatedAt: "2026-10-28T13:10:00.000Z", UpdatedAt: "2026-10-28T13:10:00.000Z", Notes: []Note{}, Timeline: []TimelineEntry{{ID: "SF-1003-t0", Status: "Submitted", Author: "Daniel Reyes", Date: "2026-10-28T13:10:00.000Z", Text: "Report submitted"}}},
            {ID: "SF-1004", Title: "Faulty classroom light", Description: "Two fluorescent tubes flicker constantly and make it hard to read the board.", Category: "Electrical & Lighting", Building: "Building A", Room: "108", Status: "In Progress", Priority: "High", ReportedByID: "u1", ReportedByName: "Maria Santos", CreatedAt: "2026-10-23T09:00:00.000Z", UpdatedAt: "2026-10-23T11:00:00.000Z", AssignedTeam: "Maintenance", AssignedToID: "u4", AssignedToName: "Joel Ramos", Notes: []Note{{ID: "n-2", Author: "Joel Ramos", Text: "Replacement tubes ordered. Scheduled for installation tomorrow.", Date: "2026-10-23T11:00:00.000Z"}}, Timeline: []TimelineEntry{{ID: "SF-1004-t0", Status: "Submitted", Author: "Maria Santos", Date: "2026-10-23T09:00:00.000Z", Text: "Report submitted"}, {ID: "SF-1004-t1", Status: "Assigned", Author: "Elena Garcia", Date: "2026-10-23T10:00:00.000Z", Text: "Assigned to Maintenance"}, {ID: "SF-1004-t2", Status: "In Progress", Author: "Joel Ramos", Date: "2026-10-23T11:00:00.000Z", Text: "Status changed to In Progress"}}},
            {ID: "SF-1005", Title: "Laboratory internet problem", Description: "No network connection at the front lab benches. Wired and Wi-Fi both fail.", Category: "Network & Internet", Building: "Science Lab", Room: "210", Status: "Resolved", Priority: "High", ReportedByID: "u2", ReportedByName: "Daniel Reyes", CreatedAt: "2026-10-19T10:20:00.000Z", UpdatedAt: "2026-10-19T12:20:00.000Z", AssignedTeam: "IT Support", AssignedToID: "u3", AssignedToName: "Alex Cruz", Resolution: "Replaced a faulty network switch port and verified connectivity at every bench.", Notes: []Note{{ID: "n-3", Author: "Alex Cruz", Text: "Found a dead switch port in the lab cabinet.", Date: "2026-10-19T12:00:00.000Z"}}, Timeline: []TimelineEntry{{ID: "SF-1005-t0", Status: "Submitted", Author: "Daniel Reyes", Date: "2026-10-19T10:20:00.000Z", Text: "Report submitted"}, {ID: "SF-1005-t1", Status: "Assigned", Author: "Elena Garcia", Date: "2026-10-19T11:20:00.000Z", Text: "Assigned to IT Support"}, {ID: "SF-1005-t2", Status: "In Progress", Author: "Alex Cruz", Date: "2026-10-19T11:50:00.000Z", Text: "Status changed to In Progress"}, {ID: "SF-1005-t3", Status: "Resolved", Author: "Alex Cruz", Date: "2026-10-19T12:20:00.000Z", Text: "Status changed to Resolved"}}},
            {ID: "SF-1006", Title: "Leaking restroom faucet", Description: "The second faucet from the left drips constantly and the floor is wet.", Category: "Plumbing", Building: "Building C", Room: "Restroom 2F", Status: "Assigned", Priority: "Medium", ReportedByID: "u1", ReportedByName: "Maria Santos", CreatedAt: "2026-10-27T06:55:00.000Z", UpdatedAt: "2026-10-27T08:55:00.000Z", AssignedTeam: "Maintenance", AssignedToID: "u4", AssignedToName: "Joel Ramos", Notes: []Note{}, Timeline: []TimelineEntry{{ID: "SF-1006-t0", Status: "Submitted", Author: "Maria Santos", Date: "2026-10-27T06:55:00.000Z", Text: "Report submitted"}, {ID: "SF-1006-t1", Status: "Assigned", Author: "Elena Garcia", Date: "2026-10-27T08:55:00.000Z", Text: "Assigned to Maintenance"}}},
        },
        Categories: []Category{
            {ID: "cat-1", Name: "Furniture", DefaultTeam: "Maintenance", Description: "Chairs, desks, doors, and windows"},
            {ID: "cat-2", Name: "Computers & Devices", DefaultTeam: "IT Support", Description: "Computers, printers, and peripherals"},
            {ID: "cat-3", Name: "Projectors & AV", DefaultTeam: "IT Support", Description: "Projectors, speakers, and displays"},
            {ID: "cat-4", Name: "Electrical & Lighting", DefaultTeam: "Maintenance", Description: "Lights, outlets, and wiring"},
            {ID: "cat-5", Name: "Plumbing", DefaultTeam: "Maintenance", Description: "Faucets, pipes, and restrooms"},
            {ID: "cat-6", Name: "Network & Internet", DefaultTeam: "IT Support", Description: "Wi-Fi, switches, and connectivity"},
        },
        Teams: []Team{
            {ID: "team-1", Name: "IT Support", LeadID: "u3", Members: 4, Handles: "Computers, AV equipment, and network problems"},
            {ID: "team-2", Name: "Maintenance", LeadID: "u4", Members: 6, Handles: "Furniture, electrical, and plumbing problems"},
        },
        Users: []User{
            {ID: "u1", Name: "Maria Santos", Email: "maria.santos@school.demo", Role: "student", Active: true, Phone: "0917 000 0001", Department: "Grade 11 - STEM"},
            {ID: "u2", Name: "Daniel Reyes", Email: "daniel.reyes@school.demo", Role: "teacher", Active: true, Phone: "0917 000 0002", Department: "Science Department"},
            {ID: "u3", Name: "Alex Cruz", Email: "alex.cruz@school.demo", Role: "it_support", Active: true, Phone: "0917 000 0003", Department: "IT Support Team"},
            {ID: "u4", Name: "Joel Ramos", Email: "joel.ramos@school.demo", Role: "maintenance", Active: true, Phone: "0917 000 0004", Department: "Maintenance Team"},
            {ID: "u5", Name: "Elena Garcia", Email: "elena.garcia@school.demo", Role: "admin", Active: true, Phone: "0917 000 0005", Department: "School Administration"},
            {ID: "u6", Name: "Paolo Lim", Email: "paolo.lim@school.demo", Role: "student", Active: true},
            {ID: "u7", Name: "Rina Dela Cruz", Email: "rina.delacruz@school.demo", Role: "teacher", Active: true},
            {ID: "u8", Name: "Kim Torres", Email: "kim.torres@school.demo", Role: "maintenance", Active: false},
        },
        Notifications: []Notification{{ID: "n8", Title: "Welcome to SchoolFix AI", Message: "This is a demo notification. Mark it as read to try the feature.", CreatedAt: "2026-10-20T08:00:00.000Z", Read: false, Roles: []string{"student", "teacher", "it_support", "maintenance", "admin"}, IssueID: ""}},
        Settings: Settings{OverdueDays: 3, NotifyOnAssignment: true, NotifyOnStatusChange: true},
    }
}

func loadStore(file string) Store {
    data, err := os.ReadFile(file)
    if err != nil || len(data) == 0 {
        s := newDefaultStore()
        _ = saveStore(file, s)
        return s
    }
    var s Store
    if err := json.Unmarshal(data, &s); err != nil {
        log.Printf("Failed to read persisted store: %v", err)
        s = newDefaultStore()
        _ = saveStore(file, s)
    }
    return s
}

func saveStore(file string, s Store) error {
    data, err := json.MarshalIndent(s, "", "  ")
    if err != nil {
        return err
    }
    return os.WriteFile(file, data, 0o644)
}

func newAppStore(file string) *appStore {
    return &appStore{store: loadStore(file), file: file}
}

func (s *appStore) persist() {
    if err := saveStore(s.file, s.store); err != nil {
        log.Printf("Persist failed: %v", err)
    }
}

func scopeIssues(list []Issue, roleID, userID, mode string) []Issue {
    switch mode {
    case "mine":
        return filter(list, func(i Issue) bool { return i.ReportedByID == userID })
    case "assigned":
        return filter(list, func(i Issue) bool { return i.AssignedToID == userID })
    default:
        if roleID == "admin" {
            return list
        }
        if roleID == "it_support" {
            return filter(list, func(i Issue) bool { return i.AssignedTeam == "IT Support" || i.AssignedToID == userID })
        }
        if roleID == "maintenance" {
            return filter(list, func(i Issue) bool { return i.AssignedTeam == "Maintenance" || i.AssignedToID == userID })
        }
        return filter(list, func(i Issue) bool { return i.ReportedByID == userID })
    }
}

func filter(items []Issue, match func(Issue) bool) []Issue {
    out := make([]Issue, 0, len(items))
    for _, item := range items {
        if match(item) {
            out = append(out, item)
        }
    }
    return out
}

func writeJSON(w http.ResponseWriter, code int, payload any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    if payload == nil {
        return
    }
    if err := json.NewEncoder(w).Encode(payload); err != nil {
        log.Printf("JSON encode failed: %v", err)
    }
}

func errorJSON(w http.ResponseWriter, code int, msg string) {
    writeJSON(w, code, map[string]string{"error": msg})
}

func cors(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }
        next.ServeHTTP(w, r)
    })
}

func contains(values []string, target string) bool {
    for _, item := range values {
        if item == target {
            return true
        }
    }
    return false
}

func getUserByEmail(users []User, email string) (User, bool) {
    for _, u := range users {
        if strings.EqualFold(u.Email, email) {
            return u, true
        }
    }
    return User{}, false
}

func randomID(prefix string) string {
    return fmt.Sprintf("%s-%d%s", prefix, time.Now().UnixNano(), randomString(4))
}

func randomString(length int) string {
    const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
    out := make([]byte, length)
    for i := range out {
        out[i] = letters[rand.Intn(len(letters))]
    }
    return string(out)
}

func buildIssueID() string {
    max := 1000
    for _, issue := range app.store.Issues {
        if n, err := strconv.Atoi(strings.TrimPrefix(issue.ID, "SF-")); err == nil && n >= max {
            max = n + 1
        }
    }
    return fmt.Sprintf("SF-%d", max)
}

var app *appStore

func setupRoutes() http.Handler {
    mux := http.NewServeMux()

    mux.HandleFunc(apiVersion+"/health", func(w http.ResponseWriter, r *http.Request) {
        writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "schoolfix-go-api"})
    })

    mux.HandleFunc(apiVersion+"/login", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
            return
        }
        var payload LoginPayload
        if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
            errorJSON(w, http.StatusBadRequest, "invalid login payload")
            return
        }
        if strings.TrimSpace(payload.Email) == "" || strings.TrimSpace(payload.Password) == "" {
            errorJSON(w, http.StatusBadRequest, "email and password are required")
            return
        }
        if payload.Password != defaultPassword {
            errorJSON(w, http.StatusUnauthorized, "incorrect email or password")
            return
        }
        user, ok := getUserByEmail(app.store.Users, payload.Email)
        if !ok {
            errorJSON(w, http.StatusUnauthorized, "incorrect email or password")
            return
        }
        writeJSON(w, http.StatusOK, map[string]any{"user": user, "roleId": user.Role})
    })

    mux.HandleFunc(apiVersion+"/accounts", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
            return
        }
        var payload AccountPayload
        if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
            errorJSON(w, http.StatusBadRequest, "invalid account payload")
            return
        }
        if strings.TrimSpace(payload.Name) == "" || strings.TrimSpace(payload.Email) == "" || strings.TrimSpace(payload.Password) == "" {
            errorJSON(w, http.StatusBadRequest, "name, email, and password are required")
            return
        }
        if strings.TrimSpace(payload.Role) == "" {
            payload.Role = "student"
        }
        if _, exists := getUserByEmail(app.store.Users, payload.Email); exists {
            errorJSON(w, http.StatusConflict, "a user with that email already exists")
            return
        }
        user := User{
            ID:         randomID("u"),
            Name:       strings.TrimSpace(payload.Name),
            Email:      strings.TrimSpace(payload.Email),
            Role:       payload.Role,
            Active:     true,
            Phone:      strings.TrimSpace(payload.Phone),
            Department: strings.TrimSpace(payload.Department),
        }
        app.mu.Lock()
        app.store.Users = append(app.store.Users, user)
        app.persist()
        app.mu.Unlock()
        writeJSON(w, http.StatusCreated, map[string]any{"user": user, "roleId": user.Role, "password": payload.Password})
    })

    mux.HandleFunc(apiVersion+"/issues", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodGet:
            roleID := r.URL.Query().Get("roleId")
            userID := r.URL.Query().Get("userId")
            mode := r.URL.Query().Get("mode")
            list := scopeIssues(app.store.Issues, roleID, userID, mode)
            sort.Slice(list, func(i, j int) bool { return list[i].CreatedAt > list[j].CreatedAt })
            writeJSON(w, http.StatusOK, list)
        case http.MethodPost:
            var payload CreateIssuePayload
            if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
                errorJSON(w, http.StatusBadRequest, "invalid issue payload")
                return
            }
            if strings.TrimSpace(payload.Title) == "" || strings.TrimSpace(payload.Description) == "" {
                errorJSON(w, http.StatusBadRequest, "title and description are required")
                return
            }
            user := payload.User
            if user.Name == "" {
                user = User{Name: "Unknown user"}
            }
            now := time.Now().UTC().Format(time.RFC3339)
            issueID := buildIssueID()
            issue := Issue{
                ID:             issueID,
                Title:          strings.TrimSpace(payload.Title),
                Description:    strings.TrimSpace(payload.Description),
                Category:       payload.Category,
                Building:       payload.Building,
                Room:           strings.TrimSpace(payload.Room),
                Status:         "Submitted",
                Priority:       "Medium",
                ReportedByID:   user.ID,
                ReportedByName: user.Name,
                CreatedAt:      now,
                UpdatedAt:      now,
                ImageName:      payload.ImageName,
                Notes:          []Note{},
                Timeline: []TimelineEntry{{ID: issueID + "-t0", Status: "Submitted", Author: user.Name, Date: now, Text: "Report submitted"}},
            }
            app.mu.Lock()
            app.store.Issues = append([]Issue{issue}, app.store.Issues...)
            app.store.Notifications = append([]Notification{{ID: randomID("n"), Title: "New report needs assignment", Message: fmt.Sprintf("%s (%s) has not been assigned yet.", issueID, issue.Title), CreatedAt: now, Read: false, Roles: []string{"admin"}, IssueID: issueID}}, app.store.Notifications...)
            app.persist()
            app.mu.Unlock()
            writeJSON(w, http.StatusCreated, issue)
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/issues/", func(w http.ResponseWriter, r *http.Request) {
        id := strings.TrimPrefix(r.URL.Path, apiVersion+"/issues/")
        if id == "" {
            errorJSON(w, http.StatusNotFound, "issue not found")
            return
        }
        app.mu.RLock()
        var issue *Issue
        for i := range app.store.Issues {
            if app.store.Issues[i].ID == id {
                issue = &app.store.Issues[i]
                break
            }
        }
        app.mu.RUnlock()
        if issue == nil {
            errorJSON(w, http.StatusNotFound, "this report does not exist")
            return
        }

        switch r.Method {
        case http.MethodGet:
            roleID := r.URL.Query().Get("roleId")
            userID := r.URL.Query().Get("userId")
            if len(scopeIssues([]Issue{*issue}, roleID, userID, "authorized")) == 0 {
                errorJSON(w, http.StatusForbidden, "you are not authorized to view this report")
                return
            }
            writeJSON(w, http.StatusOK, issue)
        case http.MethodPatch:
            var payload IssueUpdatePayload
            if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
                errorJSON(w, http.StatusBadRequest, "invalid update payload")
                return
            }
            app.mu.Lock()
            for i := range app.store.Issues {
                if app.store.Issues[i].ID != id {
                    continue
                }
                if payload.Team != "" && payload.Team != app.store.Issues[i].AssignedTeam {
                    if found := findTeamByName(app.store.Teams, payload.Team); found != nil {
                        app.store.Issues[i].AssignedTeam = found.Name
                        app.store.Issues[i].AssignedToID = found.LeadID
                        app.store.Issues[i].AssignedToName = findUserName(app.store.Users, found.LeadID)
                        if app.store.Issues[i].Status == "Submitted" {
                            app.store.Issues[i].Status = "Assigned"
                        }
                        app.store.Issues[i].Timeline = append(app.store.Issues[i].Timeline, TimelineEntry{ID: randomID("t"), Status: app.store.Issues[i].Status, Author: "System", Date: time.Now().UTC().Format(time.RFC3339), Text: "Assigned to " + found.Name})
                    } else {
                        app.mu.Unlock()
                        errorJSON(w, http.StatusBadRequest, "that team does not exist")
                        return
                    }
                }
                if payload.Status != "" && payload.Status != app.store.Issues[i].Status {
                    app.store.Issues[i].Status = payload.Status
                    app.store.Issues[i].Timeline = append(app.store.Issues[i].Timeline, TimelineEntry{ID: randomID("t"), Status: payload.Status, Author: "System", Date: time.Now().UTC().Format(time.RFC3339), Text: "Status changed to " + payload.Status})
                    if payload.Status == "Resolved" && payload.Note != "" {
                        app.store.Issues[i].Resolution = payload.Note
                    }
                }
                if payload.Note != "" {
                    app.store.Issues[i].Notes = append(app.store.Issues[i].Notes, Note{ID: randomID("note"), Author: "Staff", Text: payload.Note, Date: time.Now().UTC().Format(time.RFC3339)})
                }
                app.store.Issues[i].UpdatedAt = time.Now().UTC().Format(time.RFC3339)
                app.persist()
                writeJSON(w, http.StatusOK, app.store.Issues[i])
                app.mu.Unlock()
                return
            }
            app.mu.Unlock()
            errorJSON(w, http.StatusNotFound, "this report does not exist")
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/notifications", func(w http.ResponseWriter, r *http.Request) {
        roleID := r.URL.Query().Get("roleId")
        switch r.Method {
        case http.MethodGet:
            items := make([]Notification, 0)
            for _, n := range app.store.Notifications {
                if contains(n.Roles, roleID) && !contains(n.HiddenFor, roleID) {
                    items = append(items, n)
                }
            }
            sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt > items[j].CreatedAt })
            writeJSON(w, http.StatusOK, items)
        case http.MethodPatch:
            for i := range app.store.Notifications {
                if contains(app.store.Notifications[i].Roles, roleID) {
                    app.store.Notifications[i].Read = true
                }
            }
            app.persist()
            writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/notifications/", func(w http.ResponseWriter, r *http.Request) {
        path := strings.TrimPrefix(r.URL.Path, apiVersion+"/notifications/")
        segments := strings.Split(path, "/")
        if len(segments) < 2 {
            errorJSON(w, http.StatusBadRequest, "notification id required")
            return
        }
        roleID := segments[0]
        id := segments[1]
        switch r.Method {
        case http.MethodPatch:
            for i := range app.store.Notifications {
                if app.store.Notifications[i].ID == id {
                    app.store.Notifications[i].Read = true
                    app.persist()
                    writeJSON(w, http.StatusOK, app.store.Notifications[i])
                    return
                }
            }
            errorJSON(w, http.StatusNotFound, "notification not found")
        case http.MethodDelete:
            for i := range app.store.Notifications {
                if app.store.Notifications[i].ID == id {
                    app.store.Notifications[i].HiddenFor = append(app.store.Notifications[i].HiddenFor, roleID)
                    app.persist()
                    writeJSON(w, http.StatusOK, map[string]string{"status": "dismissed"})
                    return
                }
            }
            errorJSON(w, http.StatusNotFound, "notification not found")
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/users", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodGet:
            writeJSON(w, http.StatusOK, app.store.Users)
        case http.MethodPost:
            var payload User
            if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
                errorJSON(w, http.StatusBadRequest, "invalid user payload")
                return
            }
            if strings.TrimSpace(payload.Name) == "" || strings.TrimSpace(payload.Email) == "" {
                errorJSON(w, http.StatusBadRequest, "name and email are required")
                return
            }
            if userExists(app.store.Users, payload.Email) {
                errorJSON(w, http.StatusConflict, "a user with that email already exists")
                return
            }
            payload.ID = randomID("u")
            if payload.Role == "" {
                payload.Role = "student"
            }
            payload.Active = true
            app.mu.Lock()
            app.store.Users = append(app.store.Users, payload)
            app.persist()
            app.mu.Unlock()
            writeJSON(w, http.StatusCreated, payload)
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/users/", func(w http.ResponseWriter, r *http.Request) {
        id := strings.TrimPrefix(r.URL.Path, apiVersion+"/users/")
        if id == "" {
            errorJSON(w, http.StatusBadRequest, "user id required")
            return
        }
        if r.Method != http.MethodPatch {
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
            return
        }

        var updates map[string]any
        if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
            errorJSON(w, http.StatusBadRequest, "invalid user updates payload")
            return
        }

        app.mu.Lock()
        defer app.mu.Unlock()
        for i := range app.store.Users {
            if app.store.Users[i].ID != id {
                continue
            }

            if name, ok := updates["name"].(string); ok {
                name = strings.TrimSpace(name)
                if name == "" {
                    errorJSON(w, http.StatusBadRequest, "name cannot be blank")
                    return
                }
                app.store.Users[i].Name = name
            }
            if email, ok := updates["email"].(string); ok {
                email = strings.TrimSpace(email)
                if email == "" {
                    errorJSON(w, http.StatusBadRequest, "email cannot be blank")
                    return
                }
                if email != app.store.Users[i].Email {
                    for j := range app.store.Users {
                        if j != i && strings.EqualFold(app.store.Users[j].Email, email) {
                            errorJSON(w, http.StatusConflict, "a user with that email already exists")
                            return
                        }
                    }
                }
                app.store.Users[i].Email = email
            }
            if role, ok := updates["role"].(string); ok {
                role = strings.TrimSpace(role)
                if role == "" {
                    role = "student"
                }
                app.store.Users[i].Role = role
            }
            if active, ok := updates["active"].(bool); ok {
                app.store.Users[i].Active = active
            }
            if phone, ok := updates["phone"].(string); ok {
                app.store.Users[i].Phone = phone
            }
            if department, ok := updates["department"].(string); ok {
                app.store.Users[i].Department = department
            }

            app.persist()
            writeJSON(w, http.StatusOK, app.store.Users[i])
            return
        }

        errorJSON(w, http.StatusNotFound, "user not found")
    })

    mux.HandleFunc(apiVersion+"/categories", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodGet:
            items := make([]map[string]any, 0, len(app.store.Categories))
            for _, c := range app.store.Categories {
                count := 0
                for _, i := range app.store.Issues {
                    if i.Category == c.Name {
                        count++
                    }
                }
                items = append(items, map[string]any{"id": c.ID, "name": c.Name, "defaultTeam": c.DefaultTeam, "description": c.Description, "issueCount": count})
            }
            writeJSON(w, http.StatusOK, items)
        case http.MethodPost:
            var payload Category
            if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
                errorJSON(w, http.StatusBadRequest, "invalid category payload")
                return
            }
            if strings.TrimSpace(payload.Name) == "" {
                errorJSON(w, http.StatusBadRequest, "name is required")
                return
            }
            if categoryExists(app.store.Categories, payload.Name) {
                errorJSON(w, http.StatusConflict, "a category with that name already exists")
                return
            }
            payload.ID = randomID("cat")
            app.mu.Lock(); app.store.Categories = append(app.store.Categories, payload); app.persist(); app.mu.Unlock()
            writeJSON(w, http.StatusCreated, payload)
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/categories/", func(w http.ResponseWriter, r *http.Request) {
        id := strings.TrimPrefix(r.URL.Path, apiVersion+"/categories/")
        if id == "" {
            errorJSON(w, http.StatusBadRequest, "category id required")
            return
        }
        if r.Method != http.MethodDelete {
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
            return
        }
        app.mu.Lock();
        filtered := app.store.Categories[:0]
        for _, c := range app.store.Categories {
            if c.ID != id {
                filtered = append(filtered, c)
            }
        }
        app.store.Categories = filtered
        app.persist()
        app.mu.Unlock()
        writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
    })

    mux.HandleFunc(apiVersion+"/teams", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodGet:
            items := make([]map[string]any, 0, len(app.store.Teams))
            for _, t := range app.store.Teams {
                leadName := "Unassigned"
                for _, u := range app.store.Users {
                    if u.ID == t.LeadID {
                        leadName = u.Name
                        break
                    }
                }
                openIssues := 0
                totalIssues := 0
                for _, i := range app.store.Issues {
                    if i.AssignedTeam == t.Name {
                        totalIssues++
                        if i.Status != "Resolved" && i.Status != "Closed" {
                            openIssues++
                        }
                    }
                }
                items = append(items, map[string]any{"id": t.ID, "name": t.Name, "leadId": t.LeadID, "leadName": leadName, "members": t.Members, "handles": t.Handles, "openIssues": openIssues, "totalIssues": totalIssues})
            }
            writeJSON(w, http.StatusOK, items)
        case http.MethodPost:
            var payload Team
            if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
                errorJSON(w, http.StatusBadRequest, "invalid team payload")
                return
            }
            if strings.TrimSpace(payload.Name) == "" {
                errorJSON(w, http.StatusBadRequest, "name is required")
                return
            }
            if teamExists(app.store.Teams, payload.Name) {
                errorJSON(w, http.StatusConflict, "a team with that name already exists")
                return
            }
            payload.ID = randomID("team")
            app.mu.Lock(); app.store.Teams = append(app.store.Teams, payload); app.persist(); app.mu.Unlock()
            writeJSON(w, http.StatusCreated, payload)
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/teams/", func(w http.ResponseWriter, r *http.Request) {
        id := strings.TrimPrefix(r.URL.Path, apiVersion+"/teams/")
        if id == "" {
            errorJSON(w, http.StatusBadRequest, "team id required")
            return
        }
        if r.Method != http.MethodDelete {
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
            return
        }
        app.mu.Lock();
        filtered := app.store.Teams[:0]
        for _, t := range app.store.Teams {
            if t.ID != id {
                filtered = append(filtered, t)
            }
        }
        app.store.Teams = filtered
        app.persist(); app.mu.Unlock()
        writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
    })

    mux.HandleFunc(apiVersion+"/settings", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodGet:
            writeJSON(w, http.StatusOK, app.store.Settings)
        case http.MethodPut:
            var payload Settings
            if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
                errorJSON(w, http.StatusBadRequest, "invalid settings payload")
                return
            }
            app.mu.Lock(); app.store.Settings = payload; app.persist(); app.mu.Unlock()
            writeJSON(w, http.StatusOK, payload)
        default:
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
        }
    })

    mux.HandleFunc(apiVersion+"/reset-demo-data", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            errorJSON(w, http.StatusMethodNotAllowed, "method not allowed")
            return
        }
        app.mu.Lock(); app.store = newDefaultStore(); app.persist(); app.mu.Unlock()
        writeJSON(w, http.StatusOK, map[string]string{"status": "reset"})
    })

    return cors(mux)
}

func userExists(users []User, email string) bool {
    for _, u := range users {
        if strings.EqualFold(u.Email, email) {
            return true
        }
    }
    return false
}

func categoryExists(categories []Category, name string) bool {
    for _, c := range categories {
        if strings.EqualFold(c.Name, name) {
            return true
        }
    }
    return false
}

func teamExists(teams []Team, name string) bool {
    for _, t := range teams {
        if strings.EqualFold(t.Name, name) {
            return true
        }
    }
    return false
}

func findTeamByName(teams []Team, name string) *Team {
    for i := range teams {
        if strings.EqualFold(teams[i].Name, name) {
            return &teams[i]
        }
    }
    return nil
}

func findUserName(users []User, id string) string {
    for _, u := range users {
        if u.ID == id {
            return u.Name
        }
    }
    return ""
}

func init() {
    rand.Seed(time.Now().UnixNano())
}

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = defaultPort
    }
    dir := filepath.Join(".", "data")
    if err := os.MkdirAll(dir, 0o755); err != nil {
        log.Fatal(err)
    }
    file := filepath.Join(dir, "schoolfix-data.json")
    app = newAppStore(file)
    log.Printf("SchoolFix Go API listening on http://localhost:%s", port)
    log.Fatal(http.ListenAndServe(":"+port, setupRoutes()))
}
