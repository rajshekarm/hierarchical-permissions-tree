import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Settings, Users, Building2, GitBranch, User, Wallet } from 'lucide-react';

// Types
interface Permission {
  id: string;
  name: string;
  enabled: boolean;
}

interface HierarchyNode {
  id: string;
  name: string;
  type: 'client' | 'branch' | 'customer' | 'account';
  permissions: Permission[];
  children?: HierarchyNode[];
}

interface Account {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive';
  hierarchy: HierarchyNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  accounts: string[];
}

// Mock Data
const mockPermissions: Permission[] = [
  { id: 'p1', name: 'View All', enabled: true },
  { id: 'p2', name: 'Trade', enabled: true },
  { id: 'p3', name: 'Execute', enabled: false },
  { id: 'p4', name: 'Reporting', enabled: false },
  { id: 'p5', name: 'Analytics', enabled: false },
  { id: 'p6', name: 'Admin', enabled: false },
];

const mockHierarchy: HierarchyNode = {
  id: 'c1',
  name: 'Hedge Fund Alpha',
  type: 'client',
  permissions: [...mockPermissions],
  children: [
    {
      id: 'b1',
      name: 'North America Branch',
      type: 'branch',
      permissions: [...mockPermissions],
      children: [
        {
          id: 'cu1',
          name: 'Institutional Customer A',
          type: 'customer',
          permissions: [...mockPermissions],
          children: [
            {
              id: 'a1',
              name: 'Trading Account 001',
              type: 'account',
              permissions: [...mockPermissions],
            },
            {
              id: 'a2',
              name: 'Investment Account 002',
              type: 'account',
              permissions: [...mockPermissions],
            },
          ],
        },
        {
          id: 'cu2',
          name: 'Corporate Customer B',
          type: 'customer',
          permissions: [...mockPermissions],
          children: [
            {
              id: 'a3',
              name: 'Portfolio Account 003',
              type: 'account',
              permissions: [...mockPermissions],
            },
          ],
        },
      ],
    },
    {
      id: 'b2',
      name: 'Europe Branch',
      type: 'branch',
      permissions: [...mockPermissions],
      children: [
        {
          id: 'cu3',
          name: 'EMEA Customer C',
          type: 'customer',
          permissions: [...mockPermissions],
          children: [
            {
              id: 'a4',
              name: 'Forex Account 004',
              type: 'account',
              permissions: [...mockPermissions],
            },
          ],
        },
      ],
    },
  ],
};

const initialAccounts: Account[] = [
  { id: '1', name: 'Hedge Fund Alpha', type: 'Institutional', status: 'Active', hierarchy: mockHierarchy },
  { id: '2', name: 'Asset Manager Beta', type: 'Corporate', status: 'Active', hierarchy: mockHierarchy },
  { id: '3', name: 'Investment Group Gamma', type: 'Retail', status: 'Inactive', hierarchy: mockHierarchy },
];

const initialUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@hedgefund.com', role: 'Admin', accounts: ['1', '2'] },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@assetmanager.com', role: 'Trader', accounts: ['2'] },
  { id: '3', name: 'Mike Davis', email: 'mike@investment.com', role: 'Analyst', accounts: ['1', '3'] },
  { id: '4', name: 'Emily Chen', email: 'emily@hedgefund.com', role: 'Portfolio Manager', accounts: ['1'] },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'accounts' | 'hierarchy'>('home');
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [users] = useState<User[]>(initialUsers);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setShowAccountModal(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountModal(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const handleSaveAccount = (formData: any) => {
    if (editingAccount) {
      setAccounts(accounts.map(a => a.id === editingAccount.id ? { ...a, ...formData } : a));
    } else {
      const newAccount: Account = {
        id: Date.now().toString(),
        ...formData,
        hierarchy: mockHierarchy,
      };
      setAccounts([...accounts, newAccount]);
    }
    setShowAccountModal(false);
  };

  const handleViewHierarchy = (account: Account) => {
    setSelectedAccount(account);
    setCurrentPage('hierarchy');
  };

  const handleConfigurePermissions = (node: HierarchyNode) => {
    setSelectedNode(node);
    setShowPermissionModal(true);
  };

  const handleSavePermissions = (updatedPermissions: Permission[]) => {
    if (selectedNode && selectedAccount) {
      const updateNodePermissions = (node: HierarchyNode): HierarchyNode => {
        if (node.id === selectedNode.id) {
          return { ...node, permissions: updatedPermissions };
        }
        if (node.children) {
          return { ...node, children: node.children.map(updateNodePermissions) };
        }
        return node;
      };
      
      const updatedHierarchy = updateNodePermissions(selectedAccount.hierarchy);
      setSelectedAccount({ ...selectedAccount, hierarchy: updatedHierarchy });
      setAccounts(accounts.map(a => a.id === selectedAccount.id ? { ...selectedAccount, hierarchy: updatedHierarchy } : a));
    }
    setShowPermissionModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PermissionHub</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentPage === 'home' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('accounts')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentPage === 'accounts' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Accounts
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'home' && (
          <HomePage accounts={accounts} users={users} />
        )}
        {currentPage === 'accounts' && (
          <AccountsPage
            accounts={accounts}
            onCreateAccount={handleCreateAccount}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            onViewHierarchy={handleViewHierarchy}
          />
        )}
        {currentPage === 'hierarchy' && selectedAccount && (
          <HierarchyPage
            account={selectedAccount}
            onConfigurePermissions={handleConfigurePermissions}
            onBack={() => setCurrentPage('accounts')}
          />
        )}
      </main>

      {showAccountModal && (
        <AccountModal
          account={editingAccount}
          onClose={() => setShowAccountModal(false)}
          onSave={handleSaveAccount}
        />
      )}

      {showPermissionModal && selectedNode && (
        <PermissionModal
          node={selectedNode}
          onClose={() => setShowPermissionModal(false)}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  );
};

const HomePage: React.FC<{ accounts: Account[]; users: User[] }> = ({ accounts, users }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Firm Overview</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-700">{accounts.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Accounts</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-700">{users.length}</div>
            <div className="text-sm text-gray-600 mt-1">Active Users</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-700">{accounts.filter(a => a.status === 'Active').length}</div>
            <div className="text-sm text-gray-600 mt-1">Active Accounts</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Wallet className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Recent Accounts</h3>
          </div>
          <div className="space-y-3">
            {accounts.slice(0, 3).map(account => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{account.name}</div>
                  <div className="text-sm text-gray-500">{account.type}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {account.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Users</h3>
          </div>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountsPage: React.FC<{
  accounts: Account[];
  onCreateAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onViewHierarchy: (account: Account) => void;
}> = ({ accounts, onCreateAccount, onEditAccount, onDeleteAccount, onViewHierarchy }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>
        <button
          onClick={onCreateAccount}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Account</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.map(account => (
              <tr key={account.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{account.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{account.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {account.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => onViewHierarchy(account)}
                    className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </button>
                  <button
                    onClick={() => onEditAccount(account)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HierarchyPage: React.FC<{
  account: Account;
  onConfigurePermissions: (node: HierarchyNode) => void;
  onBack: () => void;
}> = ({ account, onConfigurePermissions, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mb-2 flex items-center space-x-1">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Back to Accounts</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Hierarchy & Permissions</h2>
          <p className="text-gray-600 mt-1">{account.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <HierarchyTree node={account.hierarchy} onConfigurePermissions={onConfigurePermissions} />
      </div>
    </div>
  );
};

const HierarchyTree: React.FC<{
  node: HierarchyNode;
  onConfigurePermissions: (node: HierarchyNode) => void;
  level?: number;
}> = ({ node, onConfigurePermissions, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const getIcon = () => {
    switch (node.type) {
      case 'client': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'branch': return <GitBranch className="w-5 h-5 text-green-600" />;
      case 'customer': return <User className="w-5 h-5 text-purple-600" />;
      case 'account': return <Wallet className="w-5 h-5 text-orange-600" />;
    }
  };

  const getBgColor = () => {
    switch (node.type) {
      case 'client': return 'bg-blue-50 border-blue-200';
      case 'branch': return 'bg-green-50 border-green-200';
      case 'customer': return 'bg-purple-50 border-purple-200';
      case 'account': return 'bg-orange-50 border-orange-200';
    }
  };

  const activePermissions = node.permissions.filter(p => p.enabled);

  return (
    <div className="space-y-2">
      <div className={`border rounded-lg p-4 ${getBgColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {node.children && node.children.length > 0 && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-white rounded p-1">
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            )}
            {getIcon()}
            <div>
              <div className="font-semibold text-gray-900">{node.name}</div>
              <div className="text-xs text-gray-500 uppercase">{node.type}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex flex-wrap gap-1">
              {activePermissions.slice(0, 3).map(p => (
                <span key={p.id} className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                  {p.name}
                </span>
              ))}
              {activePermissions.length > 3 && (
                <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-500">
                  +{activePermissions.length - 3} more
                </span>
              )}
            </div>
            <button
              onClick={() => onConfigurePermissions(node)}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2 font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && node.children && (
        <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
          {node.children.map(child => (
            <HierarchyTree
              key={child.id}
              node={child}
              onConfigurePermissions={onConfigurePermissions}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AccountModal: React.FC<{
  account: Account | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ account, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: account?.type || 'Institutional',
    status: account?.status || 'Active',
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {account ? 'Edit Account' : 'Create New Account'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Institutional</option>
              <option>Corporate</option>
              <option>Retail</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PermissionModal: React.FC<{
  node: HierarchyNode;
  onClose: () => void;
  onSave: (permissions: Permission[]) => void;
}> = ({ node, onClose, onSave }) => {
  const [permissions, setPermissions] = useState<Permission[]>([...node.permissions]);

  const togglePermission = (id: string) => {
    setPermissions(permissions.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleSubmit = () => {
    onSave(permissions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Configure Permissions</h3>
        <p className="text-gray-600 mb-4">{node.name} • {node.type}</p>
        <div className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {permissions.map(permission => (
              <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{permission.name}</span>
                <button
                  onClick={() => togglePermission(permission.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    permission.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      permission.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;