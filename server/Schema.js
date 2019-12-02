const GraphQL = require('graphql')
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList } = GraphQL

const Rule = require('./model/Rule')
const RuleType = new GraphQLObjectType({
  name: 'Rule',
  fields: () => ({
    organization: { type : GraphQLString },
    leader: { type : GraphQLString },
  })
})

const Organization = require('./model/Organization')
const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  fields: () => ({
    _id: { type : GraphQLString },
    name: { type : GraphQLString },
    leader: {
      type : new GraphQLList(RuleType),
      resolve(parent, args){
        return Rule.find({organization:parent._id})
      }
    },
    division: {
      type : new GraphQLList(DivisionType),
      resolve(parent, args){
        return Division.find({organization:parent._id})
      }
    },
    employee : {
      type : new GraphQLList(EmployeeType),
      resolve(parent, args){
        return Employee.find({organization:parent._id})
      }
    },
    client : {
      type : new GraphQLList(ClientType),
      resolve(parent, args){
        return Client.find({organization:parent._id})
      }
    },
    project : {
      type : new GraphQLList(ProjectType),
      resolve(parent, args){
        return Project.find({organization:parent._id})
      }
    },
  })
})

const Division = require('./model/Division')
const DivisionType = new GraphQLObjectType({
  name: 'Division',
  fields: () => ({
    _id: { type : GraphQLString },
    organization: { type : GraphQLString },
    name: { type : GraphQLString },
    employee : {
      type : new GraphQLList(EmployeeType),
      resolve(parent, args){
        return Employee.find({division:parent._id})
      }
    },
  })
})

const Employee = require('./model/Employee')
const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: () => ({
    _id: { type : GraphQLString },
    password: { type : GraphQLString },
    organization: {
      type : new GraphQLList(OrganizationType),
      resolve(parent, args){
        return Organization.find({_id:parent.organization})
      }
    },
    division: {
      type : new GraphQLList(DivisionType),
      resolve(parent, args){
        return Division.find({_id:parent.division})
      }
    },
    name: { type : GraphQLString },
    contact: { type : GraphQLString },
    email: { type : GraphQLString },
  })
})

const Client = require('./model/Client')
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    _id: { type : GraphQLString },
    organization: {
      type : new GraphQLList(OrganizationType),
      resolve(parent, args){
        return Organization.find({_id:parent.organization})
      }
    },
    name: { type : GraphQLString },
    contact: { type : GraphQLString },
    email: { type : GraphQLString },
    address: { type : GraphQLString },
    project : {
      type : new GraphQLList(ProjectType),
      resolve(parent, args){
        return Project.find({client:parent._id})
      }
    },
  })
})

const Project = require('./model/Project')
const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    _id: { type : GraphQLString },
    organization: {
      type : new GraphQLList(OrganizationType),
      resolve(parent, args){
        return Organization.find({_id:parent.organization})
      }
    },
    employee : {
      type : new GraphQLList(EmployeeType),
      resolve(parent, args){
        return Employee.find({_id:parent.employee})
      }
    },
    client : {
      type : new GraphQLList(ClientType),
      resolve(parent, args){
        return Client.find({_id:parent.client})
      }
    },
    module : {
      type : new GraphQLList(ModuleType),
      resolve(parent, args){
        return Module.find({project:parent._id})
      }
    },
    requirement : {
      type : new GraphQLList(RequirementType),
      resolve(parent, args){
        return Requirement.find({project:parent._id})
      }
    },
    activity : {
      type : new GraphQLList(ActivityType),
      resolve(parent, args){
        return Activity.find({project:parent._id})
      }
    },
    code: { type : GraphQLString },
    name: { type : GraphQLString },
    start: { type : GraphQLString },
    end: { type : GraphQLString },
    problem: { type : GraphQLString },
    goal: { type : GraphQLString },
    objective: { type : GraphQLString },
    success: { type : GraphQLString },
    obstacle: { type : GraphQLString },
    status: { type : GraphQLString },
  })
})

const Activity = require('./model/Activity')
const ActivityType = new GraphQLObjectType({
  name: 'Activity',
  fields: () => ({
    _id: { type : GraphQLString },
    project : {
      type : new GraphQLList(ProjectType),
      resolve(parent, args){
        return Project.find({_id:parent.project})
      }
    },
    code: { type : GraphQLString },
    detail: { type : GraphQLString },
    date: { type : GraphQLString },
  })
})

const Module = require('./model/Module')
const ModuleType = new GraphQLObjectType({
  name: 'Module',
  fields: () => ({
    _id: { type : GraphQLString },
    project : {
      type : new GraphQLList(ProjectType),
      resolve(parent, args){
        return Project.find({_id:parent.project})
      }
    },
    name: { type : GraphQLString },
    detail: { type : GraphQLString },
    requirement : {
      type : new GraphQLList(RequirementType),
      resolve(parent, args){
        return Requirement.find({module:parent._id})
      }
    }
  })
})

const Requirement = require('./model/Requirement')
const RequirementType = new GraphQLObjectType({
  name: 'Requirement',
  fields: () => ({
    _id: { type : GraphQLString },
    project : {
      type : new GraphQLList(ProjectType),
      resolve(parent, args){
        return Project.find({_id:parent.project})
      }
    },
    module : {
      type : new GraphQLList(ModuleType),
      resolve(parent, args){
        return Module.find({_id:parent.module})
      }
    },
    name: { type : GraphQLString },
    detail: { type : GraphQLString },
    status: { type : GraphQLString },
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {

    organization: {
      type: OrganizationType,
      args: { _id: { type: GraphQLString } },
      resolve(parent, args){
        return Organization.findById(args._id)
      }
    },

    division: {
      type: DivisionType,
      args: { _id: { type: GraphQLString } },
      resolve(parent, args){
        return Division.findById(args._id)
      }
    },

    employee: {
      type: EmployeeType,
      args: {
        _id: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve(parent, args){
        if (args._id) { return Employee.findById(args._id) }
        if (args.email) { return Employee.findOne({email:args.email}) }
      }
    },

    client: {
      type: ClientType,
      args: { _id: { type: GraphQLString } },
      resolve(parent, args){
        return Client.findById(args._id)
      }
    },

    project: {
      type: ProjectType,
      args: { _id: { type: GraphQLString } },
      resolve(parent, args){
        return Project.findById(args._id)
      }
    },

    myProject: {
      type : new GraphQLList(ProjectType),
      args: { employee: { type: GraphQLString } },
      resolve(parent, args){
        return Project.find({employee:args.employee})
      }
    },

    activity: {
      type: ActivityType,
      args: { _id: { type: GraphQLString } },
      resolve(parent, args){
        return Activity.findById(args._id)
      }
    },

    module: {
      type: ModuleType,
      args: { _id: { type: GraphQLString } },
      resolve(parent, args){
        return Module.findById(args._id)
      }
    },

    requirement: {
      type: RequirementType,
      args: { _id: { type: GraphQLString } },
      resolve(parent, args){
        return Requirement.findById(args._id)
      }
    },

  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {

    rule_add: {
      type: RuleType,
      args: {
        organization: { type : GraphQLString },
        leader: { type : GraphQLString },
      },
      resolve(parent, args){
        let rule = new Rule({
          organization: args.organization,
          leader: args.leader,
        });
        return rule.save();
      }
    },

    organization_add: {
      type: OrganizationType,
      args: {
        _id: { type : GraphQLString },
        name: { type : GraphQLString },
      },
      resolve(parent, args){
        let organization = new Organization({
          _id: args._id,
          name: args.name,
        });
        return organization.save();
      }
    },

    organization_edit: {
      type: OrganizationType,
      args: {
        _id: { type : GraphQLString },
        name: { type : GraphQLString },
      },
      resolve(parent, args){
        let organization = Organization.findByIdAndUpdate(args._id, {name: args.name}, {new: true})
        return organization
      }
    },

    division_add: {
      type: DivisionType,
      args: {
        _id: { type : GraphQLString },
        organization: { type : GraphQLString },
        name: { type : GraphQLString },
      },
      resolve(parent, args){
        let division = new Division({
          _id: args._id,
          organization:args.organization,
          name: args.name,
        });
        return division.save();
      }
    },

    division_edit: {
      type: DivisionType,
      args: {
        _id: { type : GraphQLString },
        name: { type : GraphQLString },
      },
      resolve(parent, args){
        let division = Division.findByIdAndUpdate(args._id, {name: args.name}, {new: true})
        return division
      }
    },

    division_delete: {
      type: DivisionType,
      args: {_id: { type : GraphQLString }},
      resolve(parent, args){
        let division = Division.findByIdAndDelete(args._id)
        return division
      }
    },

    employee_add: {
      type: EmployeeType,
      args: {
        _id: { type : GraphQLString },
        password: { type : GraphQLString },
        organization: { type : GraphQLString },
        division: { type : GraphQLString },
        name: { type : GraphQLString },
        email: { type : GraphQLString },
        contact: { type : GraphQLString },
      },
      resolve(parent, args){
        let employee = new Employee({
          _id:args._id,
          password:args.password,
          organization:args.organization,
          division:args.division,
          name:args.name,
          email:args.email,
          contact:args.contact,
        });
        return employee.save();
      }
    },

    employee_edit: {
      type: EmployeeType,
      args: {
        _id: { type : GraphQLString },
        password: { type : GraphQLString },
        division: { type : GraphQLString },
        name: { type : GraphQLString },
        email: { type : GraphQLString },
        contact: { type : GraphQLString },
      },
      resolve(parent, args){
        let update = {};
        if (args.password) { update.password = args.password }
        if (args.division) { update.division = args.division }
        if (args.name) { update.name = args.name }
        if (args.email) { update.email = args.email }
        if (args.contact) { update.contact = args.contact }
        let employee = Employee.findByIdAndUpdate(args._id, update, {new: true})
        return employee
      }
    },

    employee_delete: {
      type: EmployeeType,
      args: {_id: { type : GraphQLString }},
      resolve(parent, args){
        let employee = Employee.findByIdAndDelete(args._id)
        return employee
      }
    },

    client_add: {
      type: ClientType,
      args: {
        _id: { type : GraphQLString },
        organization: { type : GraphQLString },
        name: { type : GraphQLString },
        email: { type : GraphQLString },
        contact: { type : GraphQLString },
        address: { type : GraphQLString },
      },
      resolve(parent, args){
        let client = new Client({
          _id:args._id,
          organization:args.organization,
          name:args.name,
          email:args.email,
          contact:args.contact,
          address:args.address,
        });
        return client.save();
      }
    },

    client_edit: {
      type: ClientType,
      args: {
        _id: { type : GraphQLString },
        name: { type : GraphQLString },
        email: { type : GraphQLString },
        contact: { type : GraphQLString },
        address: { type : GraphQLString },
      },
      resolve(parent, args){
        let update = {
          name:args.name,
          email:args.email,
          contact:args.contact,
          address:args.address
        };
        let client = Client.findByIdAndUpdate(args._id, update, {new: true})
        return client
      }
    },

    client_delete: {
      type: ClientType,
      args: {_id: { type : GraphQLString }},
      resolve(parent, args){
        let client = Client.findByIdAndDelete(args._id)
        return client
      }
    },

    project_add: {
      type: ProjectType,
      args: {
        _id: { type : GraphQLString },
        organization: { type : GraphQLString },
        employee : { type : GraphQLString },
        client : { type : GraphQLString },
        code: { type : GraphQLString },
        name: { type : GraphQLString },
        start: { type : GraphQLString },
        end: { type : GraphQLString },
        problem: { type : GraphQLString },
        goal: { type : GraphQLString },
        objective: { type : GraphQLString },
        success: { type : GraphQLString },
        obstacle: { type : GraphQLString },
        status: { type : GraphQLString },
      },
      resolve(parent, args){
        let project = new Project({
          _id:args._id,
          organization:args.organization,
          employee:args.employee,
          client:args.client,
          code:args.code,
          name:args.name,
          start:args.start,
          end:args.end,
          problem:args.problem,
          goal:args.goal,
          objective:args.objective,
          success:args.success,
          obstacle:args.obstacle,
          status:args.status,
        });
        return project.save();
      }
    },

    project_update: {
      type: ProjectType,
      args: {
        _id: { type : GraphQLString },
        problem: { type : GraphQLString },
        goal: { type : GraphQLString },
        objective: { type : GraphQLString },
        success: { type : GraphQLString },
        obstacle: { type : GraphQLString },
      },
      resolve(parent, args){
        let update = {
          problem:args.problem,
          goal:args.goal,
          objective:args.objective,
          success:args.success,
          obstacle:args.obstacle,
        };
        let project = Project.findByIdAndUpdate(args._id, update, {new: true})
        return project
      }
    },

    project_status: {
      type: ProjectType,
      args: {
        _id: { type : GraphQLString },
        status: { type : GraphQLString },
      },
      resolve(parent, args){
        let update = {status:args.status};
        let project = Project.findByIdAndUpdate(args._id, update, {new: true})
        return project
      }
    },

    project_edit: {
      type: ProjectType,
      args: {
        _id: { type : GraphQLString },
        code: { type : GraphQLString },
        name: { type : GraphQLString },
        client: { type : GraphQLString },
        start: { type : GraphQLString },
        end: { type : GraphQLString },
      },
      resolve(parent, args){
        let update = {
          code:args.code,
          name:args.name,
          client:args.client,
          starts:args.start,
          end:args.end,
        };
        let project = Project.findByIdAndUpdate(args._id, update, {new: true})
        return project
      }
    },

    project_delete: {
      type: ProjectType,
      args: {_id: { type : GraphQLString }},
      resolve(parent, args){
        let project = Project.findByIdAndDelete(args._id)
        return project
      }
    },

    activity_add: {
      type: ActivityType,
      args: {
        _id: { type : GraphQLString },
        project: { type : GraphQLString },
        code: { type : GraphQLString },
        detail: { type : GraphQLString },
        date: { type : GraphQLString },
      },
      resolve(parent, args){
        let activity = new Activity({
          _id: args._id,
          project:args.project,
          code:args.code,
          detail:args.detail,
          date:args.date,
        });
        return activity.save();
      }
    },

    activity_delete: {
      type: ActivityType,
      args: {_id: { type : GraphQLString }},
      resolve(parent, args){
        let activity = Activity.findByIdAndDelete(args._id)
        return activity
      }
    },

    module_add: {
      type: ModuleType,
      args: {
        _id: { type : GraphQLString },
        project: { type : GraphQLString },
        name: { type : GraphQLString },
        detail: { type : GraphQLString },
      },
      resolve(parent, args){
        let module_ = new Module({
          _id: args._id,
          project:args.project,
          name:args.name,
          detail:args.detail,
        });
        return module_.save();
      }
    },

    module_edit: {
      type: ModuleType,
      args: {
        _id: { type : GraphQLString },
        name: { type : GraphQLString },
        detail: { type : GraphQLString },
      },
      resolve(parent, args){
        let update = {
          name:args.name,
          detail:args.detail,
        };
        let module_ = Module.findByIdAndUpdate(args._id, update, {new: true})
        return module_
      }
    },

    module_delete: {
      type: ModuleType,
      args: {_id: { type : GraphQLString }},
      resolve(parent, args){
        let module_ = Module.findByIdAndDelete(args._id)
        return module_
      }
    },

    requirement_add: {
      type: RequirementType,
      args: {
        _id: { type : GraphQLString },
        project: { type : GraphQLString },
        module: { type : GraphQLString },
        name: { type : GraphQLString },
        detail: { type : GraphQLString },
        status: { type : GraphQLString },
      },
      resolve(parent, args){
        let requirement = new Requirement({
          _id: args._id,
          project:args.project,
          module:args.module,
          name:args.name,
          detail:args.detail,
          status:args.status
        });
        return requirement.save();
      }
    },

    requirement_edit: {
      type: RequirementType,
      args: {
        _id: { type : GraphQLString },
        module: { type : GraphQLString },
        name: { type : GraphQLString },
        detail: { type : GraphQLString },
      },
      resolve(parent, args){
        let update = {
          name:args.name,
          module:args.module,
          detail:args.detail,
        };
        let requirement = Requirement.findByIdAndUpdate(args._id, update, {new: true})
        return requirement
      }
    },

    requirement_delete: {
      type: RequirementType,
      args: {_id: { type : GraphQLString }},
      resolve(parent, args){
        let requirement = Requirement.findByIdAndDelete(args._id)
        return requirement
      }
    },

  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})