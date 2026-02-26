#!/bin/bash

# Tesseric Development Server Manager
# Easily start, stop, and manage frontend/backend servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_port() {
    local port=$1
    lsof -ti:$port > /dev/null 2>&1
    return $?
}

get_pid_on_port() {
    local port=$1
    lsof -ti:$port 2>/dev/null
}

start_frontend() {
    print_info "Starting frontend on port $FRONTEND_PORT..."

    if check_port $FRONTEND_PORT; then
        print_warning "Port $FRONTEND_PORT already in use"
        echo "Run './dev.sh kill-frontend' to stop existing server"
        return 1
    fi

    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found"
        return 1
    fi

    cd $FRONTEND_DIR
    npm run dev > /dev/null 2>&1 &
    cd ..

    sleep 2

    if check_port $FRONTEND_PORT; then
        print_success "Frontend running at http://localhost:$FRONTEND_PORT"
        return 0
    else
        print_error "Frontend failed to start"
        return 1
    fi
}

start_backend() {
    print_info "Starting backend on port $BACKEND_PORT..."

    if check_port $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT already in use"
        echo "Run './dev.sh kill-backend' to stop existing server"
        return 1
    fi

    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found"
        return 1
    fi

    cd $BACKEND_DIR
    uvicorn app.main:app --reload --port $BACKEND_PORT > /dev/null 2>&1 &
    cd ..

    sleep 2

    if check_port $BACKEND_PORT; then
        print_success "Backend running at http://localhost:$BACKEND_PORT"
        print_info "API docs at http://localhost:$BACKEND_PORT/docs"
        return 0
    else
        print_error "Backend failed to start"
        print_warning "Make sure you've installed dependencies: cd backend && pip install -e ."
        return 1
    fi
}

kill_frontend() {
    print_info "Killing frontend servers..."

    local pids=$(lsof -ti:3000,3001,3002 2>/dev/null)

    if [ -z "$pids" ]; then
        print_info "No frontend servers running"
        return 0
    fi

    echo $pids | xargs kill -9 2>/dev/null
    sleep 1

    if ! check_port $FRONTEND_PORT; then
        print_success "Frontend servers stopped"
        return 0
    else
        print_error "Failed to stop frontend servers"
        return 1
    fi
}

kill_backend() {
    print_info "Killing backend server..."

    local pid=$(get_pid_on_port $BACKEND_PORT)

    if [ -z "$pid" ]; then
        print_info "No backend server running"
        return 0
    fi

    kill -9 $pid 2>/dev/null
    sleep 1

    if ! check_port $BACKEND_PORT; then
        print_success "Backend server stopped"
        return 0
    else
        print_error "Failed to stop backend server"
        return 1
    fi
}

show_status() {
    echo ""
    echo "=== Tesseric Development Server Status ==="
    echo ""

    # Frontend status
    if check_port $FRONTEND_PORT; then
        local pid=$(get_pid_on_port $FRONTEND_PORT)
        print_success "Frontend: RUNNING (PID: $pid)"
        echo "           URL: http://localhost:$FRONTEND_PORT"
    else
        print_error "Frontend: STOPPED"
    fi

    echo ""

    # Backend status
    if check_port $BACKEND_PORT; then
        local pid=$(get_pid_on_port $BACKEND_PORT)
        print_success "Backend:  RUNNING (PID: $pid)"
        echo "           URL: http://localhost:$BACKEND_PORT"
        echo "           Docs: http://localhost:$BACKEND_PORT/docs"
    else
        print_error "Backend:  STOPPED"
    fi

    echo ""
}

show_help() {
    echo ""
    echo "╔════════════════════════════════════════════════════╗"
    echo "║   Tesseric Development Server Manager v2.0         ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo ""
    echo "Usage: ./dev.sh [command|number]"
    echo ""
    echo "Commands (use name or number):"
    echo "  1) start-frontend    Start Next.js frontend on port 3000"
    echo "  2) start-backend     Start FastAPI backend on port 8000"
    echo "  3) start-all         Start both frontend and backend ⭐"
    echo "  4) kill-frontend     Stop frontend server"
    echo "  5) kill-backend      Stop backend server"
    echo "  6) kill-all          Stop all servers"
    echo "  7) restart-all       Restart both servers"
    echo "  8) status            Show status of all servers"
    echo "  9) help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh 3             # Start everything (quick!)"
    echo "  ./dev.sh start-all     # Same as above"
    echo "  ./dev.sh 8             # Check server status"
    echo "  ./dev.sh status        # Same as above"
    echo ""
    echo "💡 Tip: Run without arguments for interactive menu"
    echo ""
}

show_interactive_menu() {
    echo ""
    echo "╔════════════════════════════════════════════════════╗"
    echo "║   Tesseric Development Server Manager v2.0         ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo ""
    echo "What would you like to do?"
    echo ""
    echo -e "  ${GREEN}1)${NC} Start Frontend     (Next.js on :3000)"
    echo -e "  ${GREEN}2)${NC} Start Backend      (FastAPI on :8000)"
    echo -e "  ${GREEN}3)${NC} Start All          ⭐ Quick start everything"
    echo -e "  ${YELLOW}4)${NC} Stop Frontend"
    echo -e "  ${YELLOW}5)${NC} Stop Backend"
    echo -e "  ${YELLOW}6)${NC} Stop All"
    echo -e "  ${BLUE}7)${NC} Restart All        🔄 Clean slate"
    echo -e "  ${BLUE}8)${NC} Status             📊 Check what's running"
    echo -e "  ${BLUE}9)${NC} Help               ❓ Show detailed help"
    echo ""
    read -p "Enter your choice (1-9): " choice
    echo ""

    handle_choice "$choice"
}

handle_choice() {
    case "$1" in
        1|start-frontend)
            start_frontend
            ;;
        2|start-backend)
            start_backend
            ;;
        3|start-all)
            echo ""
            start_frontend
            echo ""
            start_backend
            echo ""
            show_status
            ;;
        4|kill-frontend)
            kill_frontend
            ;;
        5|kill-backend)
            kill_backend
            ;;
        6|kill-all)
            echo ""
            kill_frontend
            echo ""
            kill_backend
            echo ""
            print_success "All servers stopped"
            echo ""
            ;;
        7|restart-all)
            echo ""
            print_info "Restarting all servers..."
            echo ""
            kill_frontend
            kill_backend
            sleep 1
            echo ""
            start_frontend
            echo ""
            start_backend
            echo ""
            show_status
            ;;
        8|status)
            show_status
            ;;
        9|help|--help|-h)
            show_help
            ;;
        "")
            show_interactive_menu
            ;;
        *)
            print_error "Unknown choice: $1"
            echo ""
            echo "Run './dev.sh help' or './dev.sh 9' for usage information"
            echo ""
            exit 1
            ;;
    esac
}

# Main script logic
if [ -z "$1" ]; then
    # No arguments provided, show interactive menu
    show_interactive_menu
else
    # Argument provided, handle it
    handle_choice "$1"
fi
